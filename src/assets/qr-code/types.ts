import type { PictumOptions } from "../../types";

export type QrCodeFormat = "svg" | "jpg" | "png" | "webp";

export interface QrCodeOptions extends PictumOptions {
	background?: string;
	format?: QrCodeFormat;
	foreground?: string;
	quietZone?: boolean;
}
