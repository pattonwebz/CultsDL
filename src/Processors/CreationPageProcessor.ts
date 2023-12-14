// processors.ts
import { BASE_URL } from '../Constants';
const ipcRenderer = window.electron.ipcRenderer;

interface CreationData {
	title: string;
	creator: string;
	description: string;
	tags: string[];
	id: number;
}

export async function creationPageProcessor (html: string, creationId: number): Promise<Record<string, string | string[] | number>> {
	const creationData: Record<string, string | string[] | number> = {};
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');

	function getTitle () {
		return doc.querySelector<HTMLHeadingElement>('h1')?.textContent?.trim() || '';
	}

	function getAuthor () {
		return doc.querySelector<HTMLAnchorElement>('.creation-presentation__user-card .card__title--secondary a')?.textContent || '';
	}

	function getDescription () {
		return doc.querySelector<HTMLParagraphElement>('.creation-page__tab-section > .rich')?.innerText?.trim() || '';
	}

	function getImages () {
		const slides = doc.querySelectorAll('.content .creation .product-pane .slides__content picture source');
		console.log('getting images');
		console.log(slides);
		const images: string[] = [];
		slides.forEach((sc) => {
			const img = sc.getAttribute('data-srcset') ?? sc.getAttribute('srcset');
			console.log(img);
			if (img != null) {
				images.push(img);
			}
		});
		return images;
	}

	function getTags () {
		const tags: string[] = [];
		doc.querySelectorAll('#content .creation-page__tab-section .inline-list.inline-list--linked a').forEach((taglink) => {
			if (taglink instanceof HTMLAnchorElement) {
				tags.push(taglink?.textContent || '');
			}
		});
		return tags;
	}

	creationData.title = getTitle();
	creationData.creator = getAuthor();
	creationData.description = getDescription();
	creationData.tags = JSON.stringify(getTags(), null, 2);
	creationData.id = creationId;
	creationData.images = JSON.stringify(getImages(), null, 2);

	return creationData;
}