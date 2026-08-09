import { assertOneOf, createAsset, normalizeBaseUrl } from "../../internal";
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
	"initials",
	"realistic",
];
const AVATAR_FORMATS: readonly AvatarFormat[] = ["svg", "jpg", "png", "webp"];
const AVATAR_GENDERS: readonly AvatarGender[] = ["male", "female"];

export function avatar(seed: string, options: AvatarOptions = {}): PictumAsset {
	const variant = options.variant ?? "initials";
	const format = options.format ?? (variant === "realistic" ? "webp" : "svg");

	if (!AVATAR_SEED_PATTERN.test(seed)) {
		throw new TypeError(
			"Avatar seed must be 1-128 URL-safe ASCII characters and start and end with a letter or number.",
		);
	}

	assertOneOf(variant, AVATAR_VARIANTS, "Avatar variant");
	assertOneOf(format, AVATAR_FORMATS, "Avatar format");
	if (variant !== "realistic" && options.gender !== undefined) {
		throw new TypeError(
			"Avatar gender is only available for realistic avatars.",
		);
	}
	if (variant === "realistic" && format === "svg") {
		throw new TypeError("Realistic avatars do not support SVG format.");
	}
	if (options.gender !== undefined) {
		assertOneOf(options.gender, AVATAR_GENDERS, "Avatar gender");
	}

	const baseUrl = normalizeBaseUrl(options.baseUrl);
	const encodedSeed = encodeURIComponent(seed);
	if (variant === "realistic") {
		const genderPath = options.gender === undefined ? "" : `/${options.gender}`;
		const path = `${baseUrl}/avatars/realistic${genderPath}/${encodedSeed}`;
		return createAsset(`${path}.${format}`, null);
	}

	const path = `${baseUrl}/avatars/${variant}/${encodedSeed}`;
	return createAsset(`${path}.${format}`, `${path}.svg`);
}
