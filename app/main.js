// Kinda like representing the backend

const fs = require('fs');
const { app, BrowserWindow, dialog } = require('electron');
const createApplicationMenu = require('./application-menu');
require('./crash-reporter');
console.log('main process:', process.type);

const windows = new Set();

let mainWindow = null; // so that the window stays after being mounted and not potentially be garbage collected (i.e. it'll stay until the user actually close it)

// After the app is MOUNTED
app.on('ready', function () {
	mainWindow = new BrowserWindow({ show: false });
	mainWindow.loadFile(`${__dirname}/index.html`);

	// Custom menu bar
	createApplicationMenu();

	// to get rid of the blank screen flash right before the HTML is mounted
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
});

exports.createNewWindow = () => {
	let x, y;

	const currentWindow = BrowserWindow.getFocusedWindow();

	if (currentWindow) {
		const [currentWindowX, currentWindowY] = currentWindow.getPosition();
		x = currentWindowX + 10;
		y = currentWindowY + 10;
	}

	let newWindow = new BrowserWindow({ x, y, show: false });

	newWindow.loadURL(`file://${__dirname}/index.html`);

	newWindow.once('ready-to-show', () => {
		newWindow.show();
	});

	windows.add(newWindow);
	return newWindow;
};

exports.getFileFromUser = () => {
	const files = dialog.showOpenDialog(mainWindow, {
		properties: ['openFile'],
		// limiting the file types that the user can select
		buttonLabel: 'Select File',
		title: 'Choose your file',
		filters: [
			{
				name: 'Markdown Files',
				extensions: ['md', 'markdown', 'markdn', 'mdown'],
			},
			{ name: 'Text Files', extensions: ['txt', 'text'] },
		],
	});

	if (!files) return;

	const [file] = files;

	openFile(file);
};

exports.saveMarkdown = (file, content) => {
	if (!file) {
		file = dialog.showSaveDialog(mainWindow, {
			title: 'Save Markdown',
			defaultPath: app.getPath('desktop'),
			filters: [
				{
					name: 'Markdown Files',
					extensions: ['md', 'mdown', 'markdown'],
				},
			],
		});
	}

	if (!file) return;

	fs.writeFileSync(file, content);
	openFile(file);
};

exports.saveHtml = (content) => {
	const file = dialog.showSaveDialog(mainWindow, {
		title: 'Save HTML',
		defaultPath: app.getPath('desktop'),
		filters: [{ name: 'HTML Files ', extensions: ['html', 'htm'] }],
	});

	if (!file) return;
	fs.writeFileSync(file, content);
};

// This function is used both internally in this file and externally as a module, so that's why there's a weird looking "exports" placement there
const openFile = (exports.openFile = (file) => {
	const content = fs.readFileSync(file).toString();

	app.addRecentDocument(file);

	// to actually open the file's content, which gets listened by the {ipcRenderer} on the renderer.js
	mainWindow.webContents.send('file-opened', file, content);
});
