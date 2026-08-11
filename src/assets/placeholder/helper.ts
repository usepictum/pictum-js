import {
	assertIntegerInRange,
	assertOneOf,
	createAsset,
	normalizeBaseUrl,
} from "../../internal";
import type { PictumAsset } from "../../types";
import type {
	PlaceholderAppearance,
	PlaceholderFormat,
	PlaceholderOptions,
} from "./types";

const COLOR_PATTERN = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/;
const MAX_PLACEHOLDER_PIXELS = 4_194_304;
const PLACEHOLDER_FORMATS: readonly PlaceholderFormat[] = [
	"svg",
	"jpg",
	"png",
	"webp",
];

export function placeholder(options: PlaceholderOptions): PictumAsset {
	const format = options.format ?? "svg";
	assertOneOf(format, PLACEHOLDER_FORMATS, "Placeholder format");

	const dimensions = resolvePlaceholderDimensions(options);
	validatePlaceholderAppearance(options);

	if (options.density !== undefined) {
		if (format === "svg") {
			throw new TypeError("Placeholder density is not available for SVG.");
		}
		if (options.density !== 2 && options.density !== 3) {
			throw new RangeError("Placeholder density must be 2 or 3.");
		}

		const renderedWidth = dimensions.width * options.density;
		const renderedHeight = dimensions.height * options.density;
		if (
			renderedWidth > 4096 ||
			renderedHeight > 4096 ||
			renderedWidth * renderedHeight > MAX_PLACEHOLDER_PIXELS
		) {
			throw new RangeError(
				"Rendered placeholder dimensions exceed the API pixel limits.",
			);
		}
	}

	const baseUrl = normalizeBaseUrl(options.baseUrl);
	const path = `${baseUrl}/placeholder`;

	return createAsset(
		`${path}.${format}${buildPlaceholderQuery(options, dimensions, true)}`,
		`${path}.svg${buildPlaceholderQuery(options, dimensions, false)}`,
	);
}

function resolvePlaceholderDimensions(options: PlaceholderOptions): {
	width: number;
	height: number;
} {
	if (options.size !== undefined) {
		if (options.width !== undefined || options.height !== undefined) {
			throw new TypeError(
				"Placeholder accepts either size or width and height, not both.",
			);
		}

		assertIntegerInRange(options.size, 16, 2048, "Placeholder size");
		return {
			width: options.size,
			height: options.size,
		};
	}

	if (options.width === undefined || options.height === undefined) {
		throw new TypeError("Placeholder requires size or both width and height.");
	}

	assertIntegerInRange(options.width, 16, 4096, "Placeholder width");
	assertIntegerInRange(options.height, 16, 4096, "Placeholder height");

	if (options.width * options.height > MAX_PLACEHOLDER_PIXELS) {
		throw new RangeError("Placeholder dimensions exceed the API pixel limit.");
	}

	return {
		width: options.width,
		height: options.height,
	};
}

function validatePlaceholderAppearance(options: PlaceholderAppearance): void {
	if (
		options.background !== undefined &&
		!COLOR_PATTERN.test(options.background)
	) {
		throw new TypeError(
			"Placeholder background must use #rrggbb or #rrggbbaa syntax.",
		);
	}

	if (options.color !== undefined && !COLOR_PATTERN.test(options.color)) {
		throw new TypeError(
			"Placeholder color must use #rrggbb or #rrggbbaa syntax.",
		);
	}

	if (options.text !== undefined && [...options.text].length > 64) {
		throw new RangeError("Placeholder text cannot exceed 64 characters.");
	}
}

function buildPlaceholderQuery(
	options: PlaceholderOptions,
	dimensions: { width: number; height: number },
	includeDensity: boolean,
): string {
	const query = new URLSearchParams();

	if (options.size !== undefined) {
		query.set("size", String(options.size));
	} else {
		query.set("width", String(dimensions.width));
		query.set("height", String(dimensions.height));
	}
	if (includeDensity && options.density !== undefined) {
		query.set("density", String(options.density));
	}
	if (options.background !== undefined) {
		query.set("background", options.background);
	}
	if (options.color !== undefined) {
		query.set("color", options.color);
	}
	if (options.text !== undefined) {
		query.set("text", options.text);
	}

	return `?${query}`;
}
