#!/usr/bin/env node
const got = require('got');
const CookieStore = require('tough-cookie-file-store');
const CookieJar = require('tough-cookie').CookieJar;
const fs = require('fs');

// default client
let dir = './state/';
let cookieFile = dir + 'velo.cookies.json';
let tokenFile = dir + 'velo.token.json';
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
	'username': 'aobersnel@vmware.com',
	'password': 'WanObi121!@!'
};
veloLogin(creds).then((client) => {
	console.log('success');
}).catch((error) => {
	console.log(error);
});

function veloLogin(opts) { // creds in, client return
	let url = '/login/enterpriseLogin';
	console.log('Synching delicious cookies from [' + url + ']');
	let options = {
		rejectUnauthorized: false,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		form: true,
		body: {
			'username': opts.username,
			'password': opts.password
		}
	};

	// default client
	let client = baseClient.extend({
		baseUrl: 'https://vco21-usvi1.velocloud.net/portal/rest',
		rejectUnauthorized: false,
		json: true
	});
	return new Promise(function(resolve, reject) {
		client.post(url, options).then((response) => {
			console.log(JSON.stringify(response.headers, null, "\t"));
			let veloClient = client.extend({
				headers: {
					'Content-Type': 'application/json'
				}
			});
			resolve(veloClient);
		}).catch((error) => {
			console.log(error);
			reject(JSON.stringify(error, null, "\t"));
		});
	});
}
