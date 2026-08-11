import { createAsset, normalizeBaseUrl } from "../../internal";
import type { PictumAsset } from "../../types";
import type { IconOptions } from "./types";

const ICON_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function icon(name: string, options: IconOptions = {}): PictumAsset {
	const parts = name.split(":");
	const prefix = parts[0];
	const iconName = parts[1];

	if (
		parts.length !== 2 ||
		prefix === undefined ||
		iconName === undefined ||
		!ICON_NAME_PATTERN.test(prefix) ||
		!ICON_NAME_PATTERN.test(iconName)
	) {
		throw new TypeError(
			"Icon name must use lowercase kebab-case collection:name syntax.",
		);
	}

	const baseUrl = normalizeBaseUrl(options.baseUrl);
	return createAsset(`${baseUrl}/icons/${prefix}:${iconName}.svg`);
}
