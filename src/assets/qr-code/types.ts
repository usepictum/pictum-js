import type { PictumOptions } from "../../types";

export type QrCodeFormat = "svg" | "jpg" | "png" | "webp";

export interface QrCodeOptions extends PictumOptions {
	format?: QrCodeFormat;
	quietZone?: boolean;
}
