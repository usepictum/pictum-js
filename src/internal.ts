import type { PictumAsset } from "./types";

export const DEFAULT_BASE_URL = "https://pictum.dev/v1/";

export function normalizeBaseUrl(baseUrl = DEFAULT_BASE_URL): string {
	let parsed: URL;

	try {
		parsed = new URL(baseUrl);
	} catch {
		throw new TypeError("Pictum baseUrl must be an absolute URL.");
	}

	if (!["http:", "https:"].includes(parsed.protocol)) {
		throw new TypeError("Pictum baseUrl must use HTTP or HTTPS.");
	}

	if (parsed.username || parsed.password || parsed.search || parsed.hash) {
		throw new TypeError(
			"Pictum baseUrl cannot contain credentials, a query, or a fragment.",
		);
	}

	return parsed.toString().replace(/\/+$/, "");
}

export function createAsset(
	url: string,
	svgUrl: string | null = url,
): PictumAsset {
	return {
		url,
		svg: () =>
			svgUrl === null
				? Promise.reject(
						new TypeError("This Pictum asset does not support SVG."),
					)
				: fetchSvg(svgUrl),
	};
}

async function fetchSvg(url: string): Promise<string> {
	const response = await fetch(url, {
		headers: { Accept: "image/svg+xml" },
	});

	if (!response.ok) {
		const status = response.statusText
			? `${response.status} ${response.statusText}`
			: String(response.status);
		throw new Error(`Pictum SVG request failed with status ${status}.`);
	}

	return response.text();
}

export function assertOneOf(
	value: string,
	allowed: readonly string[],
	label: string,
): void {
	if (!allowed.includes(value)) {
		throw new TypeError(`${label} must be one of: ${allowed.join(", ")}.`);
	}
}

export function assertIntegerInRange(
	value: number,
	minimum: number,
	maximum: number,
	label: string,
): void {
	if (!Number.isInteger(value) || value < minimum || value > maximum) {
		throw new RangeError(
			`${label} must be an integer between ${minimum} and ${maximum}.`,
		);
	}
}
