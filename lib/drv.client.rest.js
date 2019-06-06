#!/usr/bin/env node
const got = require('got');
const CookieStore = require('tough-cookie-file-store');
const CookieJar = require('tough-cookie').CookieJar;
const fs = require('fs');

/* Module Purpose
- Interface user space with backend REST drivers
- Track session state
- Return payload
*/

// constructor
var self = restClient.prototype;
function restClient(opts) {
	this.options = Object.assign({}, opts);
	self.get = get;
	self.newToken = newToken;
	self.newLogin = newLogin;
	self.oldToken = oldToken;
	self.getClient = getClient;
	self.getSession = getSession;

	// default settings
	let dir = './state/';
	if(!this.options.name) {
		this.options.name = 'unknown';
	}
	this.cookieFile = dir + this.options.name + '.cookies.json';
	this.tokenFile = dir + this.options.name + '.token.txt';
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
	if(!fs.existsSync(this.cookieFile)) {
		fs.writeFileSync(this.cookieFile, '');
	}
	this.baseClient = got.extend({
		rejectUnauthorized: false,
		cookieJar: new CookieJar(new CookieStore(this.cookieFile))
	});
}
module.exports = restClient;


function newToken(opts, that) { // opts in, token return
	return new Promise((resolve, reject) => {
		that.baseClient.post(opts).then((response) => {
			let token = that.options.token(response);
			resolve(token);
		}).catch((e) => {
			reject(e);
		});
	});
}

function oldToken(that) { // opts in, token return
	return new Promise((resolve, reject) => {
		let token = fs.readFileSync(that.tokenFile);
		resolve(token);
	}).catch((e) => {
		reject(e);
	});
}

function newLogin(that) { // creds in in, client return
	return new Promise((resolve, reject) => {
		let opts = that.options.login();
		console.error('Synching delicious cookies from [' + opts.baseUrl + opts.url + ']');
		self.newToken(opts, that).then((token) => { // login success
			if(!fs.existsSync(that.tokenFile)) {
				fs.writeFileSync(that.tokenFile, token);
			}
			resolve(token);
		}).catch((e) => {
			console.log(e);
			reject(e);
		});
	});
}

function getClient(token, that) {
	return new Promise((resolve, reject) => {
		let client = that.baseClient.extend(that.options.client(token));
		resolve(client);
	});
}

function parseCode(resp) {
	switch(resp.statusCode) {
		case 403:
			return('[ERROR]: ' + 'type' + ' [' + resp.url + ']... [' + resp.statusCode + '] FORBIDDEN');
		break;
		case 401:
			return('[ERROR]: ' + 'type' + ' [' + resp.url + ']... [' + resp.statusCode + '] UNAUTHORIZED');
		break;
		case 200:
			return('[INFO]: ' + 'type' + ' [' + resp.url + ']... [' + resp.statusCode + '] SUCCESS');
		break;
		case 201:
			return('[INFO]: ' + 'type' + ' [' + resp.url + ']... [' + resp.statusCode + '] SUCCESS-CREATED');
		break;
		default:
			return('[' + resp.statusCode + '] ERROR');
		break;
	}
}

function get(url) {
	let that = this;
	return new Promise((resolve, reject) => {
		self.getSession(that).then((client) => {
			client.get(url).then((response) => {
				console.error(parseCode(response));
				resolve(response.body);
			}).catch((e) => {
				console.error(parseCode(e.response));
				reject(e);
			});
		}).catch((e) => {
			console.error(parseCode(e.response));
			reject(e);
		});
	});
}

function getSession(that) {
	return new Promise((resolve, reject) => {
		if(session(that)) {
			self.oldToken(that).then((token) => {
				self.getClient(token, that).then((client) => {
					resolve(client);
				});
			}).catch((e) => {
				reject(e);
			});
		} else {
			console.error('[INFO]: [' + that.options.name + '] No valid session found, authenticating... ');
			self.newLogin(that).then((token) => {
				self.getClient(token, that).then((client) => {
					resolve(client);
				});
			}).catch((e) => { // failed login
				reject(e);
			});
		}
	});
}

function session(that) {
	let file = that.tokenFile; // track
	let sessionFile = file + '.session'; // session
	let duration = 30;
	let reset = function() {
		if(fs.existsSync(sessionFile)) {
			fs.unlinkSync(sessionFile);
		}
		if(fs.existsSync(file)) {
			fs.unlinkSync(file);
		}
		fs.writeFileSync(sessionFile, '1', 'utf8');
	};
	if(fs.existsSync(sessionFile)) {
		let seconds = Math.round((new Date().getTime() - fs.statSync(sessionFile).mtime) / 1000);
		if(seconds > duration) {
			console.error('Session file[' + file + '] [' + seconds + '] older than [' + duration + '] seconds...');
			reset();
			return 0;
		} else {
			if(fs.existsSync(file)) {
				console.error('Session file[' + file + '] [' + seconds + '] younger than [' + duration + '] seconds...');
				return 1;
			} else {
				console.error('file[' + file + '] does not exist...');
				reset();
				return 0;
			}
		}
	} else {
		console.error('file[' + sessionFile + '] does not exist, writing...');
		reset();
		return 0;
	}
}
