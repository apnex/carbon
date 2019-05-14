#!/usr/bin/env node
const fs = require('fs');

/* Module Purpose
- Interface to local JSON data
- Return payload
*/

/* client example
const client = new clientLocal();
client.get('fabric/nodes').then((data) => {
	console.log(JSON.stringify(data, null, "\t"));
}).catch((e) => {
	console.error(e);
});
*/

// constructor
function clientLocal(opts) {
	this.opts = Object.assign({
		dir: './state/'
	}, opts);
	this.get = get;
}
module.exports = clientLocal;
var self = clientLocal.prototype;

function parse(call) {
	let string;
	switch(typeof(call)) {
		case "object":
			string = call.path;
		break;
		case "string":
			string = call;
		break;
	}
	string = string.replace(/^[/]+/, ""); // strip leading /
	string = string.replace(/[/]+$/, ""); // strip trailing /
	let file = 'nsx.' + string.split('/').join('.') + '.json';
	return file;
}

function get(call) {
	let file = parse(call);
	let path = this.opts['dir'] + file;
	return new Promise(function(resolve, reject) {
		if(fs.existsSync(path)) {
			let data = require(path);
			resolve(data);
		} else {
			reject('[ERROR]: file [' + path + '] missing!');
		}
	});
}
