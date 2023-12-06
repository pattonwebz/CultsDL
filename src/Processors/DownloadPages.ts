// fetchDownloadPage.ts
import { BASE_URL } from '../Constants';

const ipcRenderer = window.electron.ipcRenderer;

export async function fetchDownloadPage (selectedOrderRowsData: any): Promise<void> {
	for (const orderRowData of selectedOrderRowsData) {
		console.log('fetching download page for order', orderRowData.id);
		console.log('fetching download page for order', orderRowData.link)
		ipcRenderer.send('fetch-download-page', orderRowData.link, orderRowData.id);
		await new Promise(resolve => {
			ipcRenderer.on('fetch-download-page-reply', (_, html, number) => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, 'text/html');

				const loggedIn = doc.querySelector('.nav__action-login > details > summary > img[title="Manage my profile"]') != null;
				if (!loggedIn) {
					console.log('not logged in');
					resolve(null);
					return;
				}
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

				const downloadLinks: Record<string, string[]> = {};

				Array.from(downloadButtons)
					.forEach((button) => {
						let creationName = button.href.split('creation=')[1];
						if (creationName == null) {
							console.log('no creation name found, faking it with ##UNKNOWNCREATION##');
							console.log('we will need to figure out how to connect this later')
							creationName = '##UNKNOWNCREATION##';
						}
						if (downloadLinks[creationName] == null) {
							downloadLinks[creationName] = [];
						}
						downloadLinks[creationName].push(button.href.replace('file://', BASE_URL));
					});

				console.log(downloadLinks);

				const orderInfo = {
					orderNumber: number,
					downloadLinks
				};
				resolve(orderInfo);
			});
		}).then((orderInfo) => {
			if (orderInfo == null) {
				console.log('orderInfo is null');
				return;
			}
			console.log('orderInfo', orderInfo);
			const downloadLinksArray = Object.entries(orderInfo.downloadLinks).map(([creationName, linksArray]) => {
				if (Array.isArray(linksArray)) {
					linksArray.forEach((link) => {
						if (link.includes('https://cults3d.com/')) {
							ipcRenderer.send('download-file', link);
						}
					});
				}
				return { creationName, linksArray };
			});
			ipcRenderer.send('add-order-download-links-to-orders-json-file', orderInfo);
		});
	}
}
