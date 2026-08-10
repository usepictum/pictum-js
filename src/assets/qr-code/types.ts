import type { PictumOptions } from "../../types";

export type QrCodeFormat = "svg" | "png" | "webp";

export interface QrCodeOptions extends PictumOptions {
	format?: QrCodeFormat;
	quietZone?: boolean;
}
