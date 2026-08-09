import { avatar, icon, placeholder, qrCode } from "pictum";
import "./style.css";

const avatarAsset = avatar("ada-lovelace", {
	variant: "realistic",
	gender: "female",
});
const qrAsset = qrCode("https://docs.pictum.dev", { format: "svg" });
const placeholderAsset = placeholder({
	width: 720,
	height: 420,
	format: "webp",
	density: 2,
	background: "#e9ff70",
	color: "#111111",
	text: "Pictum",
});

setImage("#avatar-preview", "#avatar-url", avatarAsset.url);
setImage("#qr-preview", "#qr-url", qrAsset.url);
setImage("#placeholder-preview", "#placeholder-url", placeholderAsset.url);
void renderIcon();

async function renderIcon(): Promise<void> {
	const preview = query<HTMLElement>("#icon-preview");
	const status = query<HTMLElement>("#icon-status");

	try {
		preview.innerHTML = await icon("lucide:sparkles").svg();
		preview.querySelector("svg")?.setAttribute("aria-hidden", "true");
		status.textContent = "Inline SVG ready";
		status.setAttribute("data-state", "ready");
	} catch {
		preview.textContent = "SVG unavailable";
		status.textContent = "Check that the Pictum API is running";
		status.setAttribute("data-state", "error");
	}
}

function setImage(
	imageSelector: string,
	urlSelector: string,
	url: string,
): void {
	query<HTMLImageElement>(imageSelector).src = url;
	query<HTMLElement>(urlSelector).textContent = url;
}

function query<Element extends HTMLElement>(selector: string): Element {
	const element = document.querySelector<Element>(selector);
	if (element === null) {
		throw new Error(`Missing playground element: ${selector}`);
	}
	return element;
}
