// fetchDownloadPage.ts
import { BASE_URL } from '../Constants';

const ipcRenderer = window.electron.ipcRenderer;

export async function fetchDownloadPage (selectedOrderRowsData: any): Promise<void> {
	console.log('fetchDownloadPage', selectedOrderRowsData);
	for (const orderRowData of selectedOrderRowsData) {
		console.log('fetching download page for order', orderRowData.creations);
		ipcRenderer.send('fetch-download-page', orderRowData.link, orderRowData.id, orderRowData.creations);
		await new Promise(resolve => {
			ipcRenderer.on('fetch-download-page-reply', (_, html, orderId, creations) => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, 'text/html');

				const loggedIn = doc.querySelector('.nav__action-login > details > summary > img[title="Manage my profile"]') != null;
				if (!loggedIn) {
					console.error('not logged in');
					resolve(null);
					return;
				}
				const downloadButtonsContainer = doc.querySelector('#content > .grid > .grid-cell:not(.grid-cell--fit)');
				if (downloadButtonsContainer == null) {
					console.error('no download buttons container found');
					resolve(null);
					return;
				}
				const downloadButtons: NodeListOf<HTMLAnchorElement> = downloadButtonsContainer.querySelectorAll('a.btn');
				if (downloadButtons.length < 1) {
					console.error('no download buttons found');
					resolve(null);
					return;
				}

				const downloadLinks: Record<string, string[]> = {};

				Array.from(downloadButtons)
					.forEach((button) => {
						let creationName = button.href.split('creation=')[1];
						if (creationName == null) {
							console.log('no creation name found, faking it with ##UNKNOWNCREATION##');
							console.log('we will need to figure out how to connect this later');
							creationName = '##UNKNOWNCREATION##';
						}
						if (downloadLinks[creationName] == null) {
							downloadLinks[creationName] = [];
						}
						downloadLinks[creationName].push(button.href.replace('file://', BASE_URL));
						function stringToSlug (str) {
							return str.toLowerCase().replace(/ - /g, ' ').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
						}
						creations.forEach((creation) => {
							console.log('creation', creation);
							console.log(stringToSlug(creation.name));
							if (stringToSlug(creation.name) === creationName) {
								console.log('matched slug', creationName, stringToSlug(creation.name), creation.name);
								downloadLinks[creationName].creationId = creation.id;
							} else {
								console.log('did not match slug', creationName, stringToSlug(creation.name), creation.name);
							}
						});
					});

				const orderInfo = {
					orderId,
					downloadLinks
				};
				resolve(orderInfo);
			});
		}).then((orderInfo) => {
			if (orderInfo == null) {
				return;
			}

			const downloadLinksArray = Object.entries(orderInfo.downloadLinks).map(([creationName, linksArray]) => {
				if (Array.isArray(linksArray)) {
					linksArray.forEach((link) => {
						if (link.includes('https://cults3d.com/')) {
							const downloadFileData = {
								orderId: orderInfo?.orderId ?? null,
								creationName,
								link
							};
							ipcRenderer.send('download-file', downloadFileData);
						}
					});
				}
				return { creationName, linksArray };
			});
		});
	}
}
