#!/usr/bin/env node
const got = require('got');
const CookieStore = require('tough-cookie-file-store');
const CookieJar = require('tough-cookie').CookieJar;
const fs = require('fs');

/* Module Purpose
- Interface user space with backend REST drivers
- Provide NSX specific login information
- Track NSX session state
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
}
module.exports = restClient;

// default client
let type = 'nsx';
let dir = './state/';
let cookieFile = dir + type + '.cookies.json';
let tokenFile = dir + type + '.token.txt';
if (!fs.existsSync(dir)){
	fs.mkdirSync(dir);
}
if(!fs.existsSync(cookieFile)) {
	fs.writeFileSync(cookieFile, '');
}
const baseClient = got.extend({
	rejectUnauthorized: false,
	cookieJar: new CookieJar(new CookieStore(cookieFile))
});

function newToken(opts) { // opts in, token return
	return new Promise((resolve, reject) => {
		baseClient.post(opts).then((response) => {
			let token = response.headers['x-xsrf-token'];
			resolve(token);
		}).catch((e) => {
			reject(e);
		});
	});
}

function oldToken(opts) { // opts in, token return
	return new Promise((resolve, reject) => {
		let token = fs.readFileSync(tokenFile);
		resolve(token);
	}).catch((e) => {
		reject(e);
	});
}

function newLogin(that) { // creds in in, client return
	return new Promise((resolve, reject) => {
		let opts = { // login opts
			baseUrl: 'https://nsxm01.lab',
			url: '/api/session/create',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			form: true,
			body: {
				'j_username': that.options.username,
				'j_password': that.options.password
			}
		};
		console.error('Synching delicious cookies from [' + opts.url + ']');
		self.newToken(opts).then((token) => { // login success
			if(!fs.existsSync(tokenFile)) {
				fs.writeFileSync(tokenFile, token);
			}
			resolve(token);
		}).catch((e) => {
			reject(e);
		});
	});
}

function getClient(token) {
	return new Promise((resolve, reject) => {
		let client = baseClient.extend({
			baseUrl: 'https://nsxm01.lab/api/v1',
			json: true,
			headers: {
				'Content-Type': 'application/json',
				'X-XSRF-TOKEN': token
			}
		});
		resolve(client);
	});
}

function parseCode(resp) {
	switch(resp.statusCode) {
		case 403:
			return('[' + resp.statusCode + '] AUTH-ERROR');
		break;
		case 401:
			return('[' + resp.statusCode + '] AUTH-ERROR');
		break;
		case 200:
			return('[INFO]: ' + type + ' [' + resp.url + ']... [' + resp.statusCode + '] SUCCESS');
		break;
		case 201:
			return('[' + resp.statusCode + '] SUCCESS-CREATED');
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
		if(session()) {
			self.oldToken(that).then((token) => {
				self.getClient(token).then((client) => {
					resolve(client);
				});
			}).catch((e) => {
				reject(e);
			});
		} else {
			console.error('[INFO]: [' + type + '] No valid session found, authenticating... ');
			self.newLogin(that).then((token) => {
				self.getClient(token).then((client) => {
					resolve(client);
				});
			}).catch((e) => { // failed login
				reject(e);
			});
		}
	});
}

function session() {
	let file = tokenFile; // track
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
