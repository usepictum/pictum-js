import { afterEach, describe, expect, test, vi } from "vitest";
import {
	type AvatarOptions,
	avatar,
	DEFAULT_BASE_URL,
	icon,
	type PlaceholderOptions,
	type PortraitAvatarOptions,
	placeholder,
	type QrCodeOptions,
	qrCode,
} from "../src";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("helpers", () => {
	test("exports the default base URL", () => {
		expect(DEFAULT_BASE_URL).toBe("https://pictum.dev/v1/");
	});

	test("builds icon and default avatar URLs without requesting them", () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		expect(icon("devicon:react").url).toBe(
			"https://pictum.dev/v1/icons/devicon:react.svg",
		);
		expect(avatar("ada-lovelace").url).toBe(
			"https://pictum.dev/v1/avatar.svg?seed=ada-lovelace",
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	test("encodes QR code values as standard UTF-8 Base64", () => {
		expect(qrCode("é").url).toBe(
			"https://pictum.dev/v1/qrcode.svg?data=w6k%3D",
		);
		expect(qrCode("é", { format: "jpg" }).url).toBe(
			"https://pictum.dev/v1/qrcode.jpg?data=w6k%3D",
		);
		expect(qrCode("é", { quietZone: false }).url).toBe(
			"https://pictum.dev/v1/qrcode.svg?data=w6k%3D&quiet_zone=0",
		);
	});

	test("adds QR code colors in order and preserves them in canonical SVG URLs", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('<svg viewBox="0 0 256 256"></svg>'));
		vi.stubGlobal("fetch", fetchMock);

		const asset = qrCode("hello", {
			format: "png",
			quietZone: false,
			foreground: "#A1b2C3d4",
			background: "#010203",
		});

		expect(asset.url).toBe(
			"https://pictum.dev/v1/qrcode.png?data=aGVsbG8%3D&quiet_zone=0&foreground=%23A1b2C3d4&background=%23010203",
		);
		await expect(asset.svg()).resolves.toContain("<svg");
		expect(fetchMock).toHaveBeenCalledWith(
			"https://pictum.dev/v1/qrcode.svg?data=aGVsbG8%3D&quiet_zone=0&foreground=%23A1b2C3d4&background=%23010203",
			{ headers: { Accept: "image/svg+xml" } },
		);
	});

	test("keeps the default QR code URL free of color parameters", () => {
		expect(qrCode("hello").url).toBe(
			"https://pictum.dev/v1/qrcode.svg?data=aGVsbG8%3D",
		);
		expect(qrCode("hello", { foreground: "#112233" }).url).toBe(
			"https://pictum.dev/v1/qrcode.svg?data=aGVsbG8%3D&foreground=%23112233",
		);
		expect(qrCode("hello", { background: "#ffffff" }).url).toBe(
			"https://pictum.dev/v1/qrcode.svg?data=aGVsbG8%3D&background=%23ffffff",
		);
	});

	test("rejects malformed QR code colors with field-specific errors", () => {
		const invalidColors: unknown[] = [
			"#123",
			"11223344",
			"#gg2233",
			"#1234567",
			"#123456789",
			"#12345678\n",
			42,
			null,
		];

		for (const field of ["foreground", "background"] as const) {
			for (const color of invalidColors) {
				expect(() =>
					qrCode("hello", {
						[field]: color,
					} as unknown as QrCodeOptions),
				).toThrow(`QR code ${field} must use #rrggbb or #rrggbbaa syntax.`);
			}
		}
	});

	test("builds generated and portrait avatar URLs", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response('<svg viewBox="0 0 256 256"></svg>'));
		vi.stubGlobal("fetch", fetchMock);

		expect(avatar("ada", { variant: "identicon" }).url).toBe(
			"https://pictum.dev/v1/avatar.svg?seed=ada&variant=identicon",
		);
		const generated = avatar("ada", {
			variant: "identicon",
			format: "webp",
			size: 512,
		});
		expect(generated.url).toBe(
			"https://pictum.dev/v1/avatar.webp?seed=ada&variant=identicon&size=512",
		);
		await expect(generated.svg()).resolves.toContain("<svg");
		expect(fetchMock).toHaveBeenCalledWith(
			"https://pictum.dev/v1/avatar.svg?seed=ada&variant=identicon",
			{ headers: { Accept: "image/svg+xml" } },
		);
		expect(avatar("ada", { variant: "gradient" }).url).toBe(
			"https://pictum.dev/v1/avatar.svg?seed=ada&variant=gradient",
		);
		expect(avatar("ada", { variant: "monogram" }).url).toBe(
			"https://pictum.dev/v1/avatar.svg?seed=ada",
		);
		expect(avatar("ada", { variant: "portrait" }).url).toBe(
			"https://pictum.dev/v1/avatar.webp?seed=ada&variant=portrait",
		);
		expect(avatar("ada", { variant: "portrait", gender: "any" }).url).toBe(
			"https://pictum.dev/v1/avatar.webp?seed=ada&variant=portrait",
		);
		expect(avatar("ada", { variant: "portrait", gender: "male" }).url).toBe(
			"https://pictum.dev/v1/avatar.webp?seed=ada&variant=portrait&gender=male",
		);
		const portraitOptions: PortraitAvatarOptions = {
			variant: "portrait",
			gender: "female",
			format: "png",
			size: 256,
		};
		const portrait = avatar("ada", portraitOptions);
		expect(portrait.url).toBe(
			"https://pictum.dev/v1/avatar.png?seed=ada&variant=portrait&gender=female&size=256",
		);
		await expect(portrait.svg()).rejects.toThrow(/does not support SVG/);
		expect(fetchMock).toHaveBeenCalledTimes(1);
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
			color: "#000000",
			text: "Coming soon",
		});

		expect(asset.url).toBe(
			"https://pictum.dev/v1/placeholder.webp?size=320&density=2&background=%23ffffff&color=%23000000&text=Coming+soon",
		);
		await expect(asset.svg()).resolves.toContain("<svg");
		expect(fetchMock).toHaveBeenCalledWith(
			"https://pictum.dev/v1/placeholder.svg?size=320&background=%23ffffff&color=%23000000&text=Coming+soon",
			{ headers: { Accept: "image/svg+xml" } },
		);
		expect(placeholder({ width: 640, height: 360 }).url).toBe(
			"https://pictum.dev/v1/placeholder.svg?width=640&height=360",
		);
	});

	test("accepts alpha placeholder colors and rejects malformed colors", () => {
		expect(
			placeholder({
				size: 320,
				background: "#11223344",
				color: "#aabbccdd",
			}).url,
		).toBe(
			"https://pictum.dev/v1/placeholder.svg?size=320&background=%2311223344&color=%23aabbccdd",
		);

		expect(() => placeholder({ size: 320, background: "#fff" })).toThrow(
			/#rrggbb or #rrggbbaa/,
		);
		expect(() => placeholder({ size: 320, color: "#1234567" })).toThrow(
			/#rrggbb or #rrggbbaa/,
		);
		expect(() => placeholder({ size: 320, background: "#123456789" })).toThrow(
			/#rrggbb or #rrggbbaa/,
		);
		expect(() => placeholder({ size: 320, background: "112233" })).toThrow(
			"Placeholder background must use #rrggbb or #rrggbbaa syntax.",
		);
		expect(() => placeholder({ size: 320, color: "11223344" })).toThrow(
			"Placeholder color must use #rrggbb or #rrggbbaa syntax.",
		);
	});

	test("normalizes a custom versioned base URL", () => {
		expect(
			avatar("ada-lovelace", {
				baseUrl: "https://staging.example.com/pictum/v1/",
				format: "webp",
			}).url,
		).toBe(
			"https://staging.example.com/pictum/v1/avatar.webp?seed=ada-lovelace",
		);
	});

	test("rejects malformed inputs and incompatible options", () => {
		expect(() => icon("React")).toThrow(/collection:name/);
		expect(() => qrCode("")).toThrow(/1-512/);
		expect(() =>
			qrCode("hello", { format: "jpeg" } as unknown as QrCodeOptions),
		).toThrow(/svg, jpg, png, webp/);
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
		).toThrow(/identicon, gradient, monogram, portrait/);
		expect(() =>
			avatar("ada", {
				variant: "gradient",
				gender: "female",
			} as unknown as AvatarOptions),
		).toThrow(/only available for the portrait variant/);
		expect(() =>
			avatar("ada", {
				variant: "portrait",
				gender: "unknown",
			} as unknown as AvatarOptions),
		).toThrow(/any, male, female/);
		expect(() =>
			avatar("ada", {
				variant: "portrait",
				format: "svg",
			} as unknown as AvatarOptions),
		).toThrow(/does not support SVG/);
		expect(() =>
			avatar("ada", { size: 256 } as unknown as AvatarOptions),
		).toThrow(/only available for raster formats/);
		expect(() => avatar("ada", { variant: "portrait", size: 1025 })).toThrow(
			/between 16 and 1024/,
		);
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
