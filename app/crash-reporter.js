const { crashReporter } = require('electron');
const request = require('request');
const manifest = require('../package.json');

const host = 'http://localhost:3000';

const config = {
	productName: 'Markdown Utils',
	companyName: 'Khoi Le',
	submitURL: host + '/crashreports',
	uploadToServer: true,
};

crashReporter.start(config);

const sendUncaughtException = (error) => {
	const { productName, companyName } = config;
	console.info('Catching error', error);
	request.post(host + 'uncaughtexceptions', {
		_productName: productName,
		_companyName: companyName,
		_version: manifest.version,
		platform: process.platform,
		process_type: process.type,
		error: {
			name: error.name,
			message: error.message,
			fileName: error.fileName,
			stack: error.stack,
			lineNumber: error.lineNumber,
			columnNumber: error.columnNumber,
		},
	});
};

if (process.type === 'browser') {
	process.on('uncaughtException', sendUncaughtException);
} else {
	window.addEventListener('error', sendUncaughtException);
}

module.export = crashReporter;
