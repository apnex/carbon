#!/usr/bin/env node
const got = require('got');
const CookieStore = require('tough-cookie-file-store');
const CookieJar = require('tough-cookie').CookieJar;
const fs = require('fs');

/* Module Purpose
- Interface user space with backend local/REST drivers
- Provide NSX specific login information
- Track NSX session state
- Return payload
*/

// constructor
function nsxClient(opts) {
	this.options = Object.assign({}, opts);
	this.nsxLogin = nsxLogin;
	this.getClient = getClient;
	this.get = get;
}
module.exports = nsxClient;
var self = nsxClient.prototype;

// default client
let dir = './state/';
let cookieFile = dir + 'nsx.cookie.json';
let tokenFile = dir + 'nsx.token.json';
if (!fs.existsSync(dir)){
	fs.mkdirSync(dir);
}
if(!fs.existsSync(cookieFile)) {
	fs.writeFileSync(cookieFile, '');
}
const baseClient = got.extend({
	cookieJar: new CookieJar(new CookieStore(cookieFile))
});

let creds = {
	'username': 'admin',
	'password': 'VMware1!VMware1!'
};

/*
nsxLogin(creds).then((client) => {
	console.log('success');
}).catch((error) => {
	console.log(error);
});
*/

var url = '/api/v1/logical-switches';
var url = '/api/v1/logical-routers';
//get(url)

function nsxLogin(opts) { // creds in, client return
	let url = '/api/session/create';
	console.log('Synching delicious cookies from [' + url + ']');
	let options = {
		rejectUnauthorized: false,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		form: true,
		body: {
			'j_username': opts.username,
			'j_password': opts.password
		}
	};

	// default nsx client
	let client = baseClient.extend({
		baseUrl: 'https://nsxm01.lab',
		rejectUnauthorized: false,
		json: true
	});
	return new Promise(function(resolve, reject) {
		client.post(url, options).then((response) => {
			//console.log(JSON.stringify(response.headers, null, "\t"));
			let token = response.headers['x-xsrf-token'];
			let nsxClient = client.extend({
				headers: {
					'Content-Type': 'application/json',
					'X-XSRF-TOKEN': token
				}
			});
			if(!fs.existsSync(tokenFile)) {
				fs.writeFileSync(tokenFile, token);
			}
			resolve(nsxClient);
		}).catch((error) => {
			console.log(error);
			reject(JSON.stringify(error, null, "\t"));
		});
	});
}

function getClient(client) {
	let token = fs.readFileSync(tokenFile);
	let nsxClient = client.extend({
		baseUrl: 'https://nsxm01.lab',
		rejectUnauthorized: false,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			'X-XSRF-TOKEN': token
		}
	});
	return new Promise(function(resolve, reject) {
		resolve(nsxClient);
	});
}

function get(url) {
	getClient(baseClient).then((client) => {
		console.error('[INFO]: nsx [' + url + ']');
		client.get(url).then((response) => {
			console.log(JSON.stringify(response.body, null, "\t"));
		}).catch((error) => {
			console.log(JSON.stringify(error, null, "\t"));
		});
	}).catch((error) => {
		console.log(error);
	});
}
