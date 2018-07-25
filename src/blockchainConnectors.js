import debug from 'debug';
import { getEtherScanFetcher } from './ethereumExplorers';
import { getBlockcypherFetcher, getChainSoFetcher } from './bitcoinExplorers';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS, CONFIG, SUB_STEPS } from './constants';
import { VerifierError } from './models';

const log = debug('blockchainConnectors');

const BitcoinExplorers = [
  (transactionId, chain) => getChainSoFetcher(transactionId, chain),
  (transactionId, chain) => getBlockcypherFetcher(transactionId, chain)
];

const EthereumExplorers = [
  (transactionId, chain) => getEtherScanFetcher(transactionId, chain)
];

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo = [
  (transactionId, chain) => getBlockcypherFetcher(transactionId, chain)
];

export function lookForTx (transactionId, chain, certificateVersion) {
  var BlockchainExplorers;
  switch (chain) {
    case BLOCKCHAINS.bitcoin.code:
    case BLOCKCHAINS.regtest.code:
    case BLOCKCHAINS.testnet.code:
    case BLOCKCHAINS.mocknet.code:
      BlockchainExplorers = BitcoinExplorers;
      break;
    case BLOCKCHAINS.ethmain.code:
    case BLOCKCHAINS.ethropst.code:
      BlockchainExplorers = EthereumExplorers;
      break;
    default:
      return Promise.reject(new VerifierError(SUB_STEPS.fetchRemoteHash, `Invalid chain; does not map to known BlockchainExplorers.`));
  }

  // First ensure we can satisfy the MinimumBlockchainExplorers setting
  if (CONFIG.MinimumBlockchainExplorers < 0 || CONFIG.MinimumBlockchainExplorers > BlockchainExplorers.length) {
    return Promise.reject(new VerifierError(SUB_STEPS.fetchRemoteHash, `Invalid application configuration; check the CONFIG.MinimumBlockchainExplorers configuration value`));
  }
  if (CONFIG.MinimumBlockchainExplorers > BlockchainExplorersWithSpentOutputInfo.length &&
    (certificateVersion === CERTIFICATE_VERSIONS.V1_1 || certificateVersion === CERTIFICATE_VERSIONS.V1_2)) {
    return Promise.reject(new VerifierError(SUB_STEPS.fetchRemoteHash, `Invalid application configuration; check the CONFIG.MinimumBlockchainExplorers configuration value`));
  }

  // Queue up blockchain explorer APIs
  let promises = [];
  let limit;
  if (certificateVersion === CERTIFICATE_VERSIONS.V1_1 || certificateVersion === CERTIFICATE_VERSIONS.V1_2) {
    limit = CONFIG.Race ? BlockchainExplorersWithSpentOutputInfo.length : CONFIG.MinimumBlockchainExplorers;
    for (var i = 0; i < limit; i++) {
      promises.push(BlockchainExplorersWithSpentOutputInfo[i](transactionId, chain));
    }
  } else {
    limit = CONFIG.Race ? BlockchainExplorers.length : CONFIG.MinimumBlockchainExplorers;
    for (var j = 0; j < limit; j++) {
      promises.push(BlockchainExplorers[j](transactionId, chain));
    }
  }

  return new Promise((resolve, reject) => {
    return PromiseProperRace(promises, CONFIG.MinimumBlockchainExplorers).then(winners => {
      if (!winners || winners.length === 0) {
        return Promise.reject(new VerifierError(SUB_STEPS.fetchRemoteHash, `Could not confirm the transaction. No blockchain apis returned a response. This could be because of rate limiting.`));
      }

      // Compare results returned by different blockchain apis. We pick off the first result and compare the others
      // returned. The number of winners corresponds to the configuration setting `MinimumBlockchainExplorers`.
      // We require that all results agree on `issuingAddress` and `remoteHash`. Not all blockchain apis return
      // spent outputs (revoked addresses for <=v1.2), and we do not have enough coverage to compare this, but we do
      // ensure that a TxData with revoked addresses is returned, for the rare case of legacy 1.2 certificates.
      //
      // Note that APIs returning results where the number of confirmations is less than `MininumConfirmations` are
      // filtered out, but if there are at least `MinimumBlockchainExplorers` reporting that the number of confirmations
      // are above the `MininumConfirmations` threshold, then we can proceed with verification.
      var firstResponse = winners[0];
      for (var i = 1; i < winners.length; i++) {
        var thisResponse = winners[i];
        if (firstResponse.issuingAddress !== thisResponse.issuingAddress) {
          throw new VerifierError(SUB_STEPS.fetchRemoteHash, `Issuing addresses returned by the blockchain APIs were different`);
        }
        if (firstResponse.remoteHash !== thisResponse.remoteHash) {
          throw new VerifierError(SUB_STEPS.fetchRemoteHash, `Remote hashes returned by the blockchain APIs were different`);
        }
      }
      resolve(firstResponse);
    }).catch(err => {
      reject(new VerifierError(SUB_STEPS.fetchRemoteHash, err.message));
    });
  });
}

var PromiseProperRace = function (promises, count, results = []) {
  // Source: https://www.jcore.com/2016/12/18/promise-me-you-wont-use-promise-race/
  promises = Array.from(promises);
  if (promises.length < count) {
    return Promise.reject(new VerifierError(SUB_STEPS.fetchRemoteHash, `Could not confirm the transaction`));
  }

  let indexPromises = promises.map((p, index) => p.then(() => index).catch((err) => {
    log(err);
    throw index;
  }));

  return Promise.race(indexPromises).then(index => {
    let p = promises.splice(index, 1)[0];
    p.then(e => results.push(e));
    if (count === 1) {
      return results;
    }
    return PromiseProperRace(promises, count - 1, results);
  }).catch(index => {
    promises.splice(index, 1);
    return PromiseProperRace(promises, count, results);
  });
};
