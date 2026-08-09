import type { PictumOptions } from "../../types";

export type PlaceholderFormat = "svg" | "jpg" | "png" | "webp";
export type PlaceholderDensity = 2 | 3;

type PlaceholderDimensions =
	| {
			size: number;
			width?: never;
			height?: never;
	  }
	| {
			size?: never;
			width: number;
			height: number;
	  };

type PlaceholderRepresentation =
	| {
			format?: "svg";
			density?: never;
	  }
	| {
			format: Exclude<PlaceholderFormat, "svg">;
			density?: PlaceholderDensity;
	  };

export interface PlaceholderAppearance {
	background?: string;
	color?: string;
	text?: string;
}

export type PlaceholderOptions = PictumOptions &
	PlaceholderDimensions &
	PlaceholderRepresentation &
	PlaceholderAppearance;
