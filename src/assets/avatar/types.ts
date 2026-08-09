import type { PictumOptions } from "../../types";

export type GeneratedAvatarVariant = "identicon" | "gradient" | "initials";
export type AvatarVariant = GeneratedAvatarVariant | "realistic";
export type AvatarGender = "male" | "female";
export type AvatarFormat = "svg" | "jpg" | "png" | "webp";
export type AvatarRasterFormat = Exclude<AvatarFormat, "svg">;

export type GeneratedAvatarOptions = PictumOptions & {
	variant?: GeneratedAvatarVariant;
	gender?: never;
	format?: AvatarFormat;
};

export type RealisticAvatarOptions = PictumOptions & {
	variant: "realistic";
	gender?: AvatarGender;
	format?: AvatarRasterFormat;
};

export type AvatarOptions = GeneratedAvatarOptions | RealisticAvatarOptions;
