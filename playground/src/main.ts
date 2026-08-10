import { avatar, icon, placeholder, qrCode } from "pictum";
import "./style.css";

const imageSources = {
	"avatar-identicon": avatar("ada-lovelace", {
		variant: "identicon",
		format: "svg",
	}).url,
	"avatar-gradient": avatar("grace-hopper", {
		variant: "gradient",
		format: "jpg",
	}).url,
	"avatar-initials": avatar("margaret-hamilton", {
		variant: "initials",
		format: "png",
	}).url,
	"avatar-realistic-female": avatar("customer-female", {
		variant: "realistic",
		gender: "female",
		format: "webp",
	}).url,
	"avatar-realistic-male": avatar("customer-male", {
		variant: "realistic",
		gender: "male",
		format: "jpg",
	}).url,
	"qr-svg": qrCode("https://pictum.dev", { format: "svg" }).url,
	"qr-png": qrCode("https://pictum.dev", { format: "png" }).url,
	"qr-webp": qrCode("https://pictum.dev", { format: "webp" }).url,
	"qr-no-quiet-zone": qrCode("https://pictum.dev", { quietZone: false }).url,
	"placeholder-svg": placeholder({ size: 144, format: "svg", text: "SVG" }).url,
	"placeholder-jpg": placeholder({
		width: 240,
		height: 144,
		format: "jpg",
		text: "JPG",
	}).url,
	"placeholder-png": placeholder({
		width: 240,
		height: 144,
		format: "png",
		density: 2,
		text: "PNG",
	}).url,
	"placeholder-webp": placeholder({
		width: 240,
		height: 144,
		format: "webp",
		density: 3,
		background: "#202020",
		color: "#ffffff",
		text: "WebP",
	}).url,
};

for (const [id, source] of Object.entries(imageSources)) {
	query<HTMLImageElement>(`#${id}`).src = source;
}

const icons = {
	"icon-image": "lucide:image",
	"icon-qr-code": "lucide:scan-qr-code",
	"icon-user": "lucide:user-round",
	"icon-sparkles": "lucide:sparkles",
};

for (const [id, name] of Object.entries(icons)) {
	void renderIcon(`#${id}`, name);
}

async function renderIcon(selector: string, name: string): Promise<void> {
	const preview = query<HTMLElement>(selector);

	try {
		preview.innerHTML = await icon(name).svg();
		const svg = preview.querySelector("svg");
		svg?.setAttribute("role", "img");
		svg?.setAttribute("aria-label", preview.getAttribute("data-label") ?? name);
	} catch {
		preview.textContent = "Unavailable";
	}
}

function query<Element extends HTMLElement>(selector: string): Element {
	const element = document.querySelector<Element>(selector);
	if (element === null) {
		throw new Error(`Missing playground element: ${selector}`);
	}
	return element;
}
