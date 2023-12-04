// fetchDownloadPage.ts
import { BASE_URL } from '../Constants';

const ipcRenderer = window.electron.ipcRenderer;

export async function fetchDownloadPage (selectedOrderRowsData: any): Promise<void> {
	for (const orderRowData of selectedOrderRowsData) {
		ipcRenderer.send('fetch-download-page', orderRowData.link, orderRowData.id);
		await new Promise(resolve => {
			ipcRenderer.on('fetch-download-page-reply', async (event, html, number) => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, 'text/html');

				const downloadButtonsContainer = doc.querySelector('#content > .grid > .grid-cell:not(.grid-cell--fit)');
				if (downloadButtonsContainer == null) {
					console.log('no download buttons container found');
					resolve(null);
					return;
				}
				const downloadButtons: NodeListOf<HTMLAnchorElement> = downloadButtonsContainer.querySelectorAll('a.btn');
				if (downloadButtons.length < 1) {
					console.log('no download buttons found');
					resolve(null);
					return;
				}

				const downloadLinks = {};

				Array.from(downloadButtons)
					.forEach((button) => {
						const creationName = button.href.split('creation=')[1];
						if (downloadLinks[creationName] == null) {
							downloadLinks[creationName] = [];
						}
						downloadLinks[creationName].push(button.href.replace('file://', BASE_URL));
					}
					);

				console.log(downloadLinks);

				const objtosend = {
					orderNumber: number,
					downloadLinks
				};
				resolve(objtosend);
			});
		}).then((objtosend) => {
			// console.log('sending objtosend');
			// console.log(objtosend);
			ipcRenderer.send('add-order-download-links-to-orders-json-file', objtosend);
		});
	}
}
