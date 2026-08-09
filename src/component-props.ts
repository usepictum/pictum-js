import type { AvatarOptions, PlaceholderOptions, QrCodeFormat } from "./assets";
import type { PictumOptions } from "./types";

type DistributiveOmit<T, Key extends PropertyKey> = T extends unknown
	? Omit<T, Key>
	: never;

export type AvatarAssetProps = DistributiveOmit<AvatarOptions, "baseUrl"> & {
	seed: string;
	options?: PictumOptions;
};

export interface IconAssetProps {
	name: string;
	options?: PictumOptions;
}

export type PlaceholderAssetProps = DistributiveOmit<
	PlaceholderOptions,
	"baseUrl"
> & {
	options?: PictumOptions;
};

export interface QrCodeAssetProps {
	value: string;
	format?: QrCodeFormat;
	options?: PictumOptions;
}
