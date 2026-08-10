import { afterEach, describe, expect, test, vi } from "vitest";
import {
	type AvatarOptions,
	avatar,
	DEFAULT_BASE_URL,
	icon,
	type PlaceholderOptions,
	placeholder,
	type QrCodeOptions,
	qrCode,
} from "../src";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("helpers", () => {
	test("exports the default base URL", () => {
		expect(DEFAULT_BASE_URL).toBe("https://pictum.dev/api/v1/");
	});

	test("builds icon and default avatar URLs without requesting them", () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		expect(icon("devicon:react").url).toBe(
			"https://pictum.dev/api/v1/icons/devicon/react.svg",
		);
		expect(avatar("ada-lovelace").url).toBe(
			"https://pictum.dev/api/v1/avatars/initials/ada-lovelace.svg",
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test("encodes QR code values as standard UTF-8 Base64", () => {
		expect(qrCode("é").url).toBe(
			"https://pictum.dev/api/v1/qr-codes.svg?data=w6k%3D",
		);
		expect(qrCode("é", { quietZone: false }).url).toBe(
			"https://pictum.dev/api/v1/qr-codes.svg?data=w6k%3D&quiet_zone=0",
		);
	});

	test("builds identicon and realistic avatar URLs", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		expect(avatar("ada", { variant: "identicon" }).url).toBe(
			"https://pictum.dev/api/v1/avatars/identicon/ada.svg",
		);
		expect(avatar("ada", { variant: "realistic" }).url).toBe(
			"https://pictum.dev/api/v1/avatars/realistic/ada.webp",
		);
		const realistic = avatar("ada", {
			variant: "realistic",
			gender: "female",
			format: "png",
		});
		expect(realistic.url).toBe(
			"https://pictum.dev/api/v1/avatars/realistic/female/ada.png",
		);
		await expect(realistic.svg()).rejects.toThrow(/does not support SVG/);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test("builds retina placeholder URLs and canonical SVG URLs", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('<svg viewBox="0 0 320 320"></svg>'));
		vi.stubGlobal("fetch", fetchMock);

		const asset = placeholder({
			size: 320,
			format: "webp",
			density: 2,
			background: "#ffffff",
			text: "Coming soon",
		});

		expect(asset.url).toBe(
			"https://pictum.dev/api/v1/placeholders/320@2x.webp?background=%23ffffff&text=Coming+soon",
		);
		await expect(asset.svg()).resolves.toContain("<svg");
		expect(fetchMock).toHaveBeenCalledWith(
			"https://pictum.dev/api/v1/placeholders/320.svg?background=%23ffffff&text=Coming+soon",
			{ headers: { Accept: "image/svg+xml" } },
		);
	});

	test("normalizes a custom versioned base URL", () => {
		expect(
			avatar("ada-lovelace", {
				baseUrl: "https://staging.example.com/pictum/v1/",
				format: "webp",
			}).url,
		).toBe(
			"https://staging.example.com/pictum/v1/avatars/initials/ada-lovelace.webp",
		);
	});

	test("rejects malformed inputs and incompatible options", () => {
		expect(() => icon("React")).toThrow(/collection:name/);
		expect(() => qrCode("")).toThrow(/1-512/);
		expect(() =>
			qrCode("hello", { quietZone: "no" } as unknown as QrCodeOptions),
		).toThrow(/must be a boolean/);
		expect(() =>
			placeholder({ size: 320, density: 2 } as unknown as PlaceholderOptions),
		).toThrow(/not available for SVG/);
		expect(() => icon("lucide:sparkles", { baseUrl: "/v1" })).toThrow(
			/absolute URL/,
		);
		expect(() =>
			avatar("ada", { variant: "grid" } as unknown as AvatarOptions),
		).toThrow(/identicon, gradient, initials, realistic/);
		expect(() =>
			avatar("ada", {
				variant: "gradient",
				gender: "female",
			} as unknown as AvatarOptions),
		).toThrow(/only available for realistic/);
		expect(() =>
			avatar("ada", {
				variant: "realistic",
				gender: "unknown",
			} as unknown as AvatarOptions),
		).toThrow(/male, female/);
		expect(() =>
			avatar("ada", {
				variant: "realistic",
				format: "svg",
			} as unknown as AvatarOptions),
		).toThrow(/do not support SVG/);
	});

	test("reports SVG request failures", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(null, {
					status: 503,
					statusText: "Service Unavailable",
				}),
			),
		);

		await expect(icon("lucide:sparkles").svg()).rejects.toThrow(
			/503 Service Unavailable/,
		);
	});
});
