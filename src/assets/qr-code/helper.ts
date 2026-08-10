import { assertOneOf, createAsset, normalizeBaseUrl } from "../../internal";
import type { PictumAsset } from "../../types";
import type { QrCodeFormat, QrCodeOptions } from "./types";

const QR_CODE_FORMATS: readonly QrCodeFormat[] = ["svg", "jpg", "png", "webp"];

export function qrCode(
	value: string,
	options: QrCodeOptions = {},
): PictumAsset {
	const format = options.format ?? "svg";
	assertOneOf(format, QR_CODE_FORMATS, "QR code format");

	const bytes = new TextEncoder().encode(value);
	if (bytes.length === 0 || bytes.length > 512) {
		throw new RangeError("QR code value must contain 1-512 UTF-8 bytes.");
	}

	const baseUrl = normalizeBaseUrl(options.baseUrl);
	const data = new URLSearchParams({
		data: btoa(String.fromCharCode(...bytes)),
	});
	if (options.quietZone !== undefined) {
		if (typeof options.quietZone !== "boolean") {
			throw new TypeError("QR code quietZone must be a boolean.");
		}
		data.set("quiet_zone", options.quietZone ? "1" : "0");
	}
	const path = `${baseUrl}/qr-codes`;
	return createAsset(`${path}.${format}?${data}`, `${path}.svg?${data}`);
}
