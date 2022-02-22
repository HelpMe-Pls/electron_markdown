// Kinda like representing the frontend

const path = require('path');
const marked = require('marked');
const { remote, ipcRenderer } = require('electron');

let filePath = null;
let ogContent = '';

const mainProcess = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

const renderMarkdownToHtml = (markdown) => {
	htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener('keyup', (event) => {
	const currentContent = event.target.value;

	renderMarkdownToHtml(currentContent);

	updateUI(currentContent !== ogContent);
});

newFileButton.addEventListener('click', () => {
	mainProcess.createWindow();
});

openFileButton.addEventListener('click', () => {
	mainProcess.getFileFromUser();
});

// the {event} is always there as a default param
ipcRenderer.on('file-opened', (event, file, content) => {
	filePath = file;
	ogContent = content;

	markdownView.value = content;
	renderMarkdownToHtml(content);

	updateUI();
});

const updateUI = (isEdited) => {
	let title = 'Markdown Utils';
	if (filePath) {
		title = `${title} - ${path.basename(filePath)}`;
	}

	if (isEdited) {
		title += '*';
	}
	console.log(isEdited);
	currentWindow.setTitle(title);

	// for MacOS:
	currentWindow.setDocumentEdited(isEdited);
	currentWindow.setRepresentedFilename(filePath);

	saveHtmlButton.disabled = !isEdited;
	revertButton.disabled = !isEdited;
};
