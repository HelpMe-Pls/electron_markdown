// Kinda like representing the frontend

const path = require('path');
const marked = require('marked');
const { remote, ipcRenderer, shell } = require('electron');

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

// newFileButton.addEventListener('click', () => {
// 	mainProcess.createWindow();
// });

openFileButton.addEventListener('click', () => {
	mainProcess.getFileFromUser();
});

saveMarkdownButton.addEventListener('click', () => {
	mainProcess.saveMarkdown(filePath, markdownView.value);
});

saveHtmlButton.addEventListener('click', () => {
	mainProcess.saveHtml(htmlView.innerHTML);
});

showFileButton.addEventListener('click', () => {
	if (!filePath) return alert('File not found');

	shell.openItemInFolder(filePath);
});

const updateUI = (isEdited) => {
	let title = 'Markdown Utils';
	if (filePath) {
		title = `${title} - ${path.basename(filePath)}`;
	}

	if (isEdited) {
		title += '*';
	}
	currentWindow.setTitle(title);

	// for MacOS:
	currentWindow.setDocumentEdited(isEdited);
	if (filePath) currentWindow.setRepresentedFilename(filePath);

	showFileButton.disabled = !filePath;
	openInDefaultButton.disabled = !filePath;

	saveMarkdownButton.disabled = !isEdited;
	revertButton.disabled = !isEdited;
};

// the {event} is always there as a default param
ipcRenderer.on('file-opened', (event, file, content) => {
	filePath = file;
	ogContent = content;

	markdownView.value = content;
	renderMarkdownToHtml(content);

	updateUI(false);
});

document.addEventListener('dragstart', (event) => event.preventDefault());
document.addEventListener('dragover', (event) => event.preventDefault());
document.addEventListener('dragleave', (event) => event.preventDefault());
document.addEventListener('drop', (event) => event.preventDefault());

const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const supportedFileType = (file) => {
	return ['text/plain', 'text/markdown'].includes(file.type);
};

markdownView.addEventListener('dragover', (event) => {
	const file = getDraggedFile(event);

	if (supportedFileType(file)) markdownView.classList.add('drag-over');
	else markdownView.classList.add('drag-error');
});

markdownView.addEventListener('dragleave', () => {
	markdownView.classList.remove('drag-over');
	markdownView.classList.remove('drag-error');
});

markdownView.addEventListener('drop', (event) => {
	const file = getDroppedFile(event);

	if (supportedFileType(file)) mainProcess.openFile(file.path);
	else alert('This file type is not supported.');

	markdownView.classList.remove('drag-over');
	markdownView.classList.remove('drag-error');
});
