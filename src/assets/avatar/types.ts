import type { PictumOptions } from "../../types";

export type GeneratedAvatarVariant = "identicon" | "gradient" | "monogram";
export type AvatarVariant = GeneratedAvatarVariant | "portrait";
export type AvatarGender = "any" | "male" | "female";
export type AvatarFormat = "jpg" | "png" | "webp" | "svg";
export type AvatarRasterFormat = Exclude<AvatarFormat, "svg">;

type GeneratedAvatarBaseOptions = PictumOptions & {
	variant?: GeneratedAvatarVariant;
	gender?: never;
};

export type GeneratedAvatarOptions = GeneratedAvatarBaseOptions &
	(
		| {
				format?: "svg";
				size?: never;
		  }
		| {
				format: AvatarRasterFormat;
				size?: number;
		  }
	);

export type PortraitAvatarOptions = PictumOptions & {
	variant: "portrait";
	gender?: AvatarGender;
	format?: AvatarRasterFormat;
	size?: number;
};

export type AvatarOptions = GeneratedAvatarOptions | PortraitAvatarOptions;
