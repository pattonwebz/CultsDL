// processors.ts
import { BASE_URL } from '../Constants';
import { type Order, type Creation } from '../Types/interfaces';

export function processOrdersReply (html: string, setNextPage: (nextPage: string) => void): Order[] {
	console.log('fetch-download-page-reply');
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const nextPageElement = doc.querySelector('.pagination .paginate.next a');
	if ((nextPageElement != null) && nextPageElement instanceof HTMLAnchorElement) {
		setNextPage(nextPageElement.href.replace('file://', BASE_URL));
	} else {
		setNextPage('');
	}

	const newOrders: Order[] = [];
	doc.querySelectorAll('#content table tbody tr').forEach((row) => {
		const cells = row.querySelectorAll('td');
		const orderNumber = cells[0].textContent.trim();
		const orderDate = cells[1].textContent.trim();
		const orderTotal = cells[3].textContent.trim();
		const orderLink = cells[4].querySelector('a').href.replace('file://', BASE_URL).trim();

		const order: Order = {
			number: orderNumber,
			date: orderDate,
			price: orderTotal,
			link: orderLink
		};

		const creatorCells = row.querySelectorAll('.creation-cell > div');

		const creations: Creation[] = [];
		creatorCells.forEach((cell) => {
			// if there is a details.help element, then it is a private link
			const privateLink = cell.querySelector('details.help');
			if (privateLink != null) {
				const title = privateLink.querySelector('summary').title;
				const thumbnail = privateLink.querySelector('img').src;
				const creatorLink = cell.querySelector('.btn-plain');
				const parts = creatorLink.href.split('/');
				const creator = parts[5]; // 'TaterBeard'

				creations.push({
					title,
					thumbnail,
					link: '##PRIVATE##',
					creator
				});

				return;
			}

			const link = cell.querySelector('a');
			const messagesLink = cell.querySelector('.btn-plain');
			const thumbnail = cell.querySelector('.painting-image');

			if ((link != null) && (messagesLink != null) && (thumbnail != null)) {
				const dataTitle = link.title;
				const href = link.href;
				const messagesHref = messagesLink.href;
				const thumbnailSrc = thumbnail.src;

				const parts = messagesHref.split('/');
				const username = parts[5];

				creations.push({
					title: dataTitle,
					thumbnail: thumbnailSrc,
					link: href.replace('file://', BASE_URL),
					creator: username
				});
			}
		});

		// console.log(creations);
		console.log(creations.length);
		order.creations = creations;
		newOrders.push(order);
	});
	return newOrders;
}
