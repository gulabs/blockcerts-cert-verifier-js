import { ExplorerAPI, IBlockchainObject, TransactionData } from '@blockcerts/explorer-lookup';
import { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

export declare enum VERIFICATION_STATUSES {
	DEFAULT = "standby",
	FAILURE = "failure",
	STARTING = "starting",
	SUCCESS = "success"
}
export declare class VerificationSubstep {
	code: string;
	label: string;
	labelPending: string;
	parentStep: string | VerificationSteps;
	status: VERIFICATION_STATUSES;
	constructor(parentStepKey: string | VerificationSteps, subStepKey: string);
}
export interface IVerificationMapItemSuite {
	proofType: string;
	subSteps: VerificationSubstep[];
}
export interface IVerificationMapItem {
	code: VerificationSteps;
	label: string;
	labelPending: string;
	subSteps?: VerificationSubstep[];
	status?: VERIFICATION_STATUSES;
	suites?: IVerificationMapItemSuite[];
}
declare enum VerificationSteps {
	formatValidation = "formatValidation",
	proofVerification = "proofVerification",
	identityVerification = "identityVerification",
	statusCheck = "statusCheck",
	final = "final"
}
declare enum SUB_STEPS {
	checkImagesIntegrity = "checkImagesIntegrity",
	checkRevokedStatus = "checkRevokedStatus",
	checkExpiresDate = "checkExpiresDate",
	controlVerificationMethod = "controlVerificationMethod"
}
export interface MerklePath {
	left?: string;
	right?: string;
}
export interface MerkleProof2017 {
	type: string[];
	merkleRoot: string;
	targetHash: string;
	proof: MerklePath[];
	anchors: MerkleProof2017Anchor[];
}
export interface MerkleProof2017Anchor {
	sourceId: string;
	type: string;
	chain?: string;
}
export interface RecipientProfile {
	type: string[];
	name: string;
	publicKey: string;
}
export interface BlockcertsV2 {
	"@context": JsonLDContext;
	type: string;
	id: string;
	recipient?: {
		type: string;
		identity: string;
		hashed: boolean;
		/**
		 * @deprecated v2 alpha only
		 */
		recipientProfile?: RecipientProfile;
	};
	recipientProfile?: RecipientProfile;
	badge?: {
		type: string;
		id?: string;
		name?: string;
		subtitle?: string;
		description?: string;
		image?: string;
		criteria?: any;
		issuer: {
			type?: string;
			id?: string;
			name?: string;
			url?: string;
			image?: string;
			email?: string;
			revocationList?: string;
		};
		signatureLines?: Array<{
			type?: string[];
			jobTitle?: string;
			image?: string;
		}>;
	};
	verification?: {
		type: string[];
		publicKey?: string;
		/**
		 * @deprecated v2 alpha only
		 */
		creator?: string;
	};
	issuedOn?: string;
	metadataJson?: string;
	displayHtml?: string;
	expires?: string;
	nonce?: string;
	universalIdentifier?: string;
	signature: MerkleProof2017;
}
export interface IDidContext {
	"@base": string;
}
export interface IServiceEndpoint {
	serviceEndpoint?: string;
	type?: string;
	id?: string;
}
export interface IDidDocument {
	id?: string;
	"@context"?: Array<string | IDidContext>;
	verificationMethod?: IDidDocumentPublicKey[];
	authentication?: Array<string | IDidDocumentPublicKey>;
	assertionMethod?: string[];
	service?: IServiceEndpoint[];
	capabilityDelegation?: string[];
	keyAgreement?: IDidDocumentPublicKey[];
	publicKey?: IDidDocumentPublicKey[];
}
export interface KeyObjectV1 {
	date: string;
	key: string;
	invalidated?: string;
}
export interface KeyObjectV2 {
	id: string;
	created: string;
	expires?: string;
	revoked?: string;
}
export interface Issuer {
	"@context"?: string[];
	type?: string;
	id?: string;
	name?: string;
	url?: string;
	image?: string;
	email?: string;
	revocationList?: string;
	publicKey?: string[] | KeyObjectV2[];
	introductionURL?: string;
	introductionAuthenticationMethod?: string;
	introductionSuccessURL?: string;
	introductionErrorURL?: string;
	analyticsURL?: string;
	issuingEstimateAuth?: string;
	issuingEstimateUrl?: string;
	didDocument?: IDidDocument;
	verificationMethod?: IDidDocumentPublicKey[];
	publicKeys?: string[] | KeyObjectV2[];
	issuer_key?: KeyObjectV1[];
	revocation_key?: KeyObjectV1[];
	issuerKeys?: KeyObjectV1[];
	revocationKeys?: KeyObjectV1[];
}
export interface VCProof {
	type: string;
	created: string;
	proofValue?: string;
	jws?: string;
	proofPurpose: string;
	verificationMethod: string;
	chainedProofType?: string;
	previousProof?: VCProof;
}
export interface VerifiableCredential {
	"@context": JsonLDContext;
	id: string;
	type: string[];
	credentialStatus?: {
		id: string;
		type: string;
		statusListIndex?: string;
		statusListCredential?: string;
	};
	expirationDate?: string;
	evidence?: Array<{
		type: string[];
		id?: string;
	}>;
	holder?: {
		type?: string;
		id?: string;
	};
	issued?: string;
	issuanceDate?: string;
	refreshService?: {
		type?: string;
		id?: string;
	};
	termsOfUse?: Array<{
		type: string;
		id?: string;
	}>;
	validFrom?: string;
	validUntil?: string;
	proof: VCProof | VCProof[];
}
export interface BlockcertsV3Display {
	contentMediaType: string;
	content: string;
	contentEncoding?: string;
}
export interface BlockcertsV3 extends VerifiableCredential {
	issuer: string | Issuer;
	issuanceDate: string;
	credentialSubject: {
		id?: string;
		publicKey?: string;
		name?: string;
		type?: string;
		claim?: {
			type?: string;
			id?: string;
			name?: string;
			description?: string;
			criteria?: string;
		};
	};
	metadata?: string;
	display?: BlockcertsV3Display;
	nonce?: string;
	proof: VCProof | VCProof[];
	/**
	 * @deprecated v3 alpha only
	 */
	metadataJson?: string;
}
export declare type Blockcerts = BlockcertsV2 | BlockcertsV3;
export interface CustomJsonLDContextDefinition {
	[key: string]: {
		"@id"?: string;
		"@type"?: string;
	} | string;
}
export declare type JsonLDContext = Array<string | CustomJsonLDContextDefinition>;
export interface Receipt {
	path?: MerklePath[];
	merkleRoot?: string;
	targetHash?: string;
	anchors?: string[] | MerkleProof2017Anchor[];
	type?: string[];
	proof?: MerklePath[];
}
export interface SuiteAPI {
	executeStep: (step: string, action: () => any, verificationSuite?: string) => Promise<any>;
	document: Blockcerts;
	explorerAPIs: ExplorerAPI[];
	proof: VCProof | MerkleProof2017;
	issuer: Issuer;
}
declare abstract class Suite {
	abstract type: string;
	constructor(props: SuiteAPI);
	abstract init(): Promise<void>;
	abstract verifyProof(): Promise<void>;
	abstract verifyIdentity(): Promise<void>;
	abstract getProofVerificationSteps(parentStepKey: string): VerificationSubstep[];
	abstract getIdentityVerificationSteps(parentStepKey: string): VerificationSubstep[];
	abstract getIssuerPublicKey(): string;
	abstract getIssuerName(): string;
	abstract getIssuerProfileDomain(): string;
	abstract getIssuerProfileUrl(): string;
	abstract getSigningDate(): string;
	getChain?(): IBlockchainObject;
	getReceipt?(): Receipt;
	getTransactionIdString?(): string;
	getTransactionLink?(): string;
	getRawTransactionLink?(): string;
	abstract executeStep(step: string, action: any, verificationSuite: string): Promise<any>;
}
export interface IVerificationStepCallbackAPI {
	code: string;
	label: string;
	status: VERIFICATION_STATUSES;
	errorMessage?: string;
	parentStep: string;
}
export declare type IVerificationStepCallbackFn = (update: IVerificationStepCallbackAPI) => any;
export declare type TVerifierProofMap = Map<number, VCProof>;
export interface IFinalVerificationStatus {
	code: VerificationSteps.final;
	status: VERIFICATION_STATUSES;
	message: string;
}
declare class Verifier {
	expires: string;
	id: string;
	issuer: Issuer;
	revocationKey: string;
	documentToVerify: Blockcerts;
	explorerAPIs: ExplorerAPI[];
	txData: TransactionData;
	private _stepsStatuses;
	private readonly hashlinkVerifier;
	verificationSteps: IVerificationMapItem[];
	supportedVerificationSuites: any;
	proofVerifiers: Suite[];
	verificationProcess: SUB_STEPS[];
	proofMap: TVerifierProofMap;
	constructor({ certificateJson, expires, hashlinkVerifier, id, issuer, revocationKey, explorerAPIs }: {
		certificateJson: Blockcerts;
		expires: string;
		id: string;
		issuer: Issuer;
		hashlinkVerifier: HashlinkVerifier;
		revocationKey: string;
		explorerAPIs?: ExplorerAPI[];
	});
	getVerificationSteps(): IVerificationMapItem[];
	getSignersData(): Signers[];
	init(): Promise<void>;
	verify(stepCallback?: IVerificationStepCallbackFn): Promise<IFinalVerificationStatus>;
	private getRevocationListUrl;
	private getProofTypes;
	private getProofMap;
	private instantiateProofVerifiers;
	private prepareVerificationProcess;
	private registerSignatureVerificationSteps;
	private getSuiteSubsteps;
	private registerIdentityVerificationSteps;
	private executeStep;
	private _stepCallback;
	private checkImagesIntegrity;
	private checkRevokedStatus;
	private checkExpiresDate;
	private controlVerificationMethod;
	private findStepFromVerificationProcess;
	private _failed;
	private _isFailing;
	private _succeed;
	private _setFinalStep;
	private _updateStatusCallback;
}
export declare class SignatureImage {
	image: string;
	jobTitle: string;
	name: string;
	constructor(image: string, jobTitle: string, name: string);
}
export interface CertificateOptions {
	locale?: string;
	explorerAPIs?: ExplorerAPI[];
	didResolverUrl?: string;
}
export interface Signers {
	chain?: IBlockchainObject;
	issuerName?: string;
	issuerProfileDomain?: string;
	issuerProfileUrl?: string;
	issuerPublicKey: string;
	rawTransactionLink?: string;
	signatureSuiteType: string;
	signingDate: string;
	transactionId?: string;
	transactionLink?: string;
}
export declare class Certificate {
	certificateImage?: string;
	certificateJson: Blockcerts;
	description?: string;
	display?: BlockcertsV3Display;
	expires: string;
	explorerAPIs: ExplorerAPI[];
	id: string;
	isFormatValid: boolean;
	issuedOn: string;
	issuer: Issuer;
	locale: string;
	metadataJson: any;
	name?: string;
	options: CertificateOptions;
	recipientFullName: string;
	recordLink: string;
	revocationKey: string;
	sealImage?: string;
	signature?: string;
	signatureImage?: SignatureImage[];
	signers: Signers[];
	subtitle?: string;
	hashlinkVerifier: HashlinkVerifier;
	verificationSteps: IVerificationMapItem[];
	verifier: Verifier;
	constructor(certificateDefinition: Blockcerts | string, options?: CertificateOptions);
	init(): Promise<void>;
	verify(stepCallback?: IVerificationStepCallbackFn): Promise<IFinalVerificationStatus>;
	private parseJson;
	private setSigners;
	private _setOptions;
	private _setProperties;
	parseHashlinksInDisplay(display: BlockcertsV3Display): Promise<BlockcertsV3Display>;
}
export function getSupportedLanguages(): string[];
declare enum Versions {
	V1_1 = "1.1",
	V1_2 = "1.2",
	V2_0 = "2.0",
	V3_0_alpha = "3.0-alpha",
	V3_0_beta = "3.0-beta",
	V3_0 = "3.0"
}
export interface BlockcertsVersion {
	versionNumber: number;
	version: Versions;
}
export declare function retrieveBlockcertsVersion(context: JsonLDContext | string): BlockcertsVersion;

export {
	Versions as CERTIFICATE_VERSIONS,
};

export {};
