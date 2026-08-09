export interface PictumOptions {
	baseUrl?: string;
}

export interface PictumAsset {
	readonly url: string;
	svg(): Promise<string>;
}
