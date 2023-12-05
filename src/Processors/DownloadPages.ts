// fetchDownloadPage.ts
import { BASE_URL } from '../Constants';

const ipcRenderer = window.electron.ipcRenderer;

export async function fetchDownloadPage (selectedOrderRowsData: any): Promise<void> {
	for (const orderRowData of selectedOrderRowsData) {
		ipcRenderer.send('fetch-download-page', orderRowData.link, orderRowData.id);
		await new Promise(resolve => {
			ipcRenderer.on('fetch-download-page-reply', (_, html, number) => {
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

				const downloadLinks: Record<string, string[]> = {};

				Array.from(downloadButtons)
					.forEach((button) => {
						let creationName = button.href.split('creation=')[1];
						if (creationName == null) {
							console.log('no creation name found faking it with ##UNKNOWNCREATOR##');
							creationName = '##UNKNOWNCREATOR##';
						}
						if (downloadLinks[creationName] == null) {
							downloadLinks[creationName] = [];
						}
						downloadLinks[creationName].push(button.href.replace('file://', BASE_URL));
					}
					);

				console.log(downloadLinks);

				const orderInfo = {
					orderNumber: number,
					downloadLinks
				};
				resolve(orderInfo);
			});
		}).then((orderInfo) => {
			console.log('orderInfo', orderInfo);
			Object.entries(orderInfo.downloadLinks).forEach((downloadLink) => {
				console.log('downloadLinkGroups', downloadLink);
				downloadLink.forEach((linksArray) => {
					console.log('linksArray', linksArray);
					if (Array.isArray(linksArray)) {
						console.log('linksArray is an array');
						linksArray.forEach((link) => {
							console.log('link', link);
							if (link.includes('https://cults3d.com/')) {
								console.log('sending download-file', link);
								ipcRenderer.send('download-file', link);
							} else {
								console.log('not sending download-file', link);
							}
						});
					}
				});
			});
			ipcRenderer.send('add-order-download-links-to-orders-json-file', orderInfo);
		});
	}
}
