import { assertOneOf, createAsset, normalizeBaseUrl } from "../../internal";
import type { PictumAsset } from "../../types";
import type { QrCodeFormat, QrCodeOptions } from "./types";

const QR_CODE_FORMATS: readonly QrCodeFormat[] = ["svg", "jpg", "png", "webp"];
const QR_CODE_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/;

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
	if (options.foreground !== undefined) {
		assertQrCodeColor(options.foreground, "foreground");
		data.set("foreground", options.foreground);
	}
	if (options.background !== undefined) {
		assertQrCodeColor(options.background, "background");
		data.set("background", options.background);
	}
	const path = `${baseUrl}/qrcode`;
	return createAsset(`${path}.${format}?${data}`, `${path}.svg?${data}`);
}

function assertQrCodeColor(
	value: unknown,
	field: "background" | "foreground",
): asserts value is string {
	if (typeof value !== "string" || !QR_CODE_COLOR_PATTERN.test(value)) {
		throw new TypeError(
			`QR code ${field} must use #rrggbb or #rrggbbaa syntax.`,
		);
	}
}
