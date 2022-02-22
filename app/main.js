// Kinda like representing the backend

const fs = require('fs');
const { app, BrowserWindow, dialog } = require('electron');

let mainWindow = null; // so that the window stays after being mounted and not potentially be garbage collected (i.e. it'll stay until the user actually close it)

// After the app is MOUNTED
app.on('ready', function () {
	mainWindow = new BrowserWindow({ show: false });
	mainWindow.loadFile(`${__dirname}/index.html`);

	// to get rid of the blank screen flash right before the HTML is mounted
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
});

console.log('It is what it is.');

exports.getFileFromUser = () => {
	const files = dialog.showOpenDialog({
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
		file = dialog.showSaveDialog({
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

const openFile = (file) => {
	const content = fs.readFileSync(file).toString();

	app.addRecentDocument(file);

	// to actually open the file's content, which gets listened by the {ipcRenderer} on the renderer.js
	mainWindow.webContents.send('file-opened', file, content);
};
