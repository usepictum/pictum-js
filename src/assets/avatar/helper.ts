import {
	assertIntegerInRange,
	assertOneOf,
	createAsset,
	normalizeBaseUrl,
} from "../../internal";
import type { PictumAsset } from "../../types";
import type {
	AvatarFormat,
	AvatarGender,
	AvatarOptions,
	AvatarVariant,
} from "./types";

const AVATAR_SEED_PATTERN =
	/^[A-Za-z0-9](?:[A-Za-z0-9._~@+-]{0,126}[A-Za-z0-9])?$/;
const AVATAR_VARIANTS: readonly AvatarVariant[] = [
	"identicon",
	"gradient",
	"monogram",
	"portrait",
];
const AVATAR_FORMATS: readonly AvatarFormat[] = ["jpg", "png", "webp", "svg"];
const AVATAR_GENDERS: readonly AvatarGender[] = ["any", "male", "female"];
const MIN_AVATAR_SIZE = 16;
const MAX_AVATAR_SIZE = 1024;

export function avatar(seed: string, options: AvatarOptions = {}): PictumAsset {
	const variant = options.variant ?? "monogram";
	const format = options.format ?? (variant === "portrait" ? "webp" : "svg");

	if (!AVATAR_SEED_PATTERN.test(seed)) {
		throw new TypeError(
			"Avatar seed must be 1-128 URL-safe ASCII characters and start and end with a letter or number.",
		);
	}

	assertOneOf(variant, AVATAR_VARIANTS, "Avatar variant");
	assertOneOf(format, AVATAR_FORMATS, "Avatar format");
	if (variant !== "portrait" && options.gender !== undefined) {
		throw new TypeError(
			"Avatar gender is only available for the portrait variant.",
		);
	}
	if (variant === "portrait" && format === "svg") {
		throw new TypeError(
			"The portrait avatar variant does not support SVG format.",
		);
	}
	if (options.gender !== undefined) {
		assertOneOf(options.gender, AVATAR_GENDERS, "Avatar gender");
	}
	if (format === "svg" && options.size !== undefined) {
		throw new TypeError("Avatar size is only available for raster formats.");
	}
	if (options.size !== undefined) {
		assertIntegerInRange(
			options.size,
			MIN_AVATAR_SIZE,
			MAX_AVATAR_SIZE,
			"Avatar size",
		);
	}

	const baseUrl = normalizeBaseUrl(options.baseUrl);
	const query = new URLSearchParams({ seed });
	if (variant !== "monogram") {
		query.set("variant", variant);
	}
	if (
		variant === "portrait" &&
		options.gender !== undefined &&
		options.gender !== "any"
	) {
		query.set("gender", options.gender);
	}

	const path = `${baseUrl}/avatar`;
	if (variant === "portrait") {
		if (options.size !== undefined) {
			query.set("size", String(options.size));
		}
		return createAsset(`${path}.${format}?${query}`, null);
	}

	const svgUrl = `${path}.svg?${query}`;
	if (options.size !== undefined) {
		query.set("size", String(options.size));
	}
	return createAsset(`${path}.${format}?${query}`, svgUrl);
}
