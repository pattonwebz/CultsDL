// fetchDownloadPage.ts
import { BASE_URL } from '../Constants';
import { Creation } from '../Types/interfaces';

const ipcRenderer = window.electron.ipcRenderer;

interface OrderInfo {
	orderId: number;
	downloadLinks: Record<string, string[]>;
}

interface OrderRowData {
	id: number;
	creations: Creation[];
	link: string;
}

export async function fetchDownloadPage (selectedOrderRowsData: OrderRowData[]): Promise<void> {
	console.log('fetchDownloadPage', selectedOrderRowsData);

	for (const orderRowData of selectedOrderRowsData) {
		console.log('fetching download page for order', orderRowData.creations);
		console.log('orderRowData', orderRowData);
		await ipcRenderer.invoke('get-html-body', orderRowData.link).then(async (body: string) => {
			let orderInfo: OrderInfo = {
				orderId: 0,
				downloadLinks: {}
			};
			const parser = new DOMParser();
			const doc = parser.parseFromString(body, 'text/html');

			const loggedIn = doc.querySelector('.nav__action-login > details > summary > img[title="Manage my profile"]') != null;
			if (!loggedIn) {
				console.error('not logged in');
				return;
			}
			const downloadButtonsContainer = doc.querySelector('#content > .grid > .grid-cell:not(.grid-cell--fit)');
			if (downloadButtonsContainer == null) {
				console.error('no download buttons container found');
				return;
			}
			const downloadButtons: NodeListOf<HTMLAnchorElement> = downloadButtonsContainer.querySelectorAll('a.btn');
			if (downloadButtons.length < 1) {
				console.error('no download buttons found');
				return;
			}

			function stringToSlug (str: string) {
				return str.toLowerCase().replace(/ - /g, ' ').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
			}

			const downloadLinks: Record<string, string[]> = {};

			Array.from(downloadButtons)
				.forEach((button) => {
					let creationName = button.href.split('creation=')[1];
					if (creationName == null) {
						console.log('no creation name found, faking it with ##UNKNOWNCREATION##');
						console.log('we will need to figure out how to connect this later');
						creationName = '##UNKNOWNCREATION##';
						if (orderRowData.creations.length === 1) {
							console.log('only one creation, using that');
							creationName = stringToSlug(orderRowData.creations[0].name);
						}
					}
					if (downloadLinks[creationName] == null) {
						downloadLinks[creationName] = [];
					}
					downloadLinks[creationName].push(button.href.replace('file://', BASE_URL));

					orderRowData.creations.forEach((creation) => {
						console.log('creation', creation);
						console.log(stringToSlug(creation.name));
						if (stringToSlug(creation.name) === creationName) {
							console.log('matched slug', creationName, stringToSlug(creation.name), creation.name, creationName);
							downloadLinks[creationName].creationId = creation.id;
						} else {
							console.log('did not match slug', creationName, stringToSlug(creation.name), creation.name, creationName);
						}
					});
				});

			orderInfo = {
				orderId: orderRowData.id,
				downloadLinks
			};

			await tryDownloadLinksArray(orderInfo);
		});
	}
}

const tryDownloadLinksArray = async (orderInfo) => {
	if (orderInfo == null) {
		return;
	}

	const downloadLinksArray = Object.entries(orderInfo.downloadLinks).map(async ([creationName, linksArray]) => {
		if (Array.isArray(linksArray)) {
			for (const link of linksArray) {
				if (link.includes('https://cults3d.com/')) {
					const downloadFileData = {
						orderId: orderInfo?.orderId ?? null,
						creationName,
						link,
						creationId: orderInfo?.downloadLinks[creationName]?.creationId ?? null
					};
					const min = Math.ceil(100);
					const max = Math.floor(2000);
					const waitTime = Math.floor(Math.random() * (max - min + 1)) + min;
					await new Promise((resolve) => setTimeout(resolve, waitTime)).then(() => {
						ipcRenderer.send('download-file', downloadFileData);
					});
				}
			}
		}
		return { creationName, linksArray };
	});
};
