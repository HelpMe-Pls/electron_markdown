const fs = require('fs');
const { app, BrowserWindow, dialog } = require('electron');

let mainWindow = null; // so that the window stays after being mounted and not potentially be garbage collected (i.e. it'll stay until the user actually close it)

// After the app is MOUNTED
app.on('ready', function () {
	mainWindow = new BrowserWindow({ show: false });
	mainWindow.loadFile(`${__dirname}/index.html`);

	getFileFromUser();

	// to get rid of the blank screen flash right before the HTML is mounted
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
	});
});

console.log('It is what it is.');
const getFileFromUser = () => {
	const files = dialog.showOpenDialog({
		properties: ['openFile'],
		// limiting the file types that the user can select
		filters: [
			{ name: 'Text Files', extensions: ['txt', 'text'] },
			{ name: 'Markdown Files', extensions: ['md', 'markdown'] },
		],
	});

	if (!files) return;

	const [file] = files;
	const content = fs.readFileSync(file).toString();

	console.log(content);
};
