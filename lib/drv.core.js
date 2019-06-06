#!/usr/bin/env node
const clientRest = require('./drv.client.rest');

// called from shell
if(process.argv[1].match(/core/g)) {
	let args = process.argv.slice(2);
	if(args.length > 0) {
		get(args[0]).then((data) => {
			console.log(JSON.stringify(data, null, "\t"));
		}).catch((e) => {
			console.error(e);
		});
	}
}

// constructor
function core(opts) {
	this.opts = Object.assign({
		dir: './state/'
	}, opts);
	this.get = get;
}
module.exports = core;
var self = core.prototype;

var vrniAuth = {
	"host": "https://field-demo.vrni.cmbu.local",
	"baseUrl": "https://field-demo.vrni.cmbu.local/api/ni",
	"authUrl": "/auth/token",
	"method": "post",
	"parameters": {
		"token": "NetworkInsight {$response.body#/token}"
	},
	"securityDefinitions": {
		"token": {
			"description": "Authorization: NetworkInsight {token}",
			"in": "header",
			"name": "Authorization",
			"type": "apiKey"
		}
	},
	"security": {
		"token": []
	}
};

function vrniToken(response) {
	return response.body.token;
}

function vrniLogin() { // http options object
	return {
		baseUrl: 'https://field-demo.vrni.cmbu.local',
		url: '/api/ni/auth/token',
		json: true,
		body: {
			"username": "demouser@cmbu.local",
			"password": "demoVMware1!",
			"domain": {
				"domain_type": "LOCAL"
			}
		}
	};
}

function vrniClient(token) { // http options object
	return {
		baseUrl: 'https://field-demo.vrni.cmbu.local/api/ni',
		json: true,
		headers: {
			'Accept': 'application/json',
			'Authorization': 'NetworkInsight ' + token
		}
	}
}

// handle endpoint specific parameters
function get(path) {
	return new Promise(function(resolve, reject) {
		const client = new clientRest({
			name: 'vrni',
			login: vrniLogin,
			token: vrniToken,
			client: vrniClient
		});
		client.get(path).then((data) => {
			resolve(data);
		}).catch((e) => {
			reject(e);
		});
	});
}
