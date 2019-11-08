#!/usr/bin/env node
const fs = require('fs');
//const clientRest = require('./drv.client.vrni');
const qc = require('./query');
const q = new qc();

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;
const cyan = chalk.cyan;

// called from shell
if(process.argv[1].match(/commit/g)) {
	let file = './ctx.scope';
	let scope = {};
	if(fs.existsSync(file)) {
		scope = loadJSON(file);
	}
	let cmds = scope.path.split('/');
	cmds.shift();
	let arg = process.argv[2];
	let path = q.toChain(cmds, 0, 0);
	let action = scope.action;
	console.error('--[ ' + blue(q.toChain(cmds, 0, 0)) + ' ]--');
	console.log(JSON.stringify(scope, null, "\t"));

	//run(scope);

	if(scope.path) {
		get(scope.path).then((data) => {
			console.log(JSON.stringify(data, null, "\t"));
		}).catch((e) => {
			//console.error(e);
		});
	}
}

// constructor
function commit(opts) {
	this.opts = Object.assign({
		dir: './state/'
	}, opts);
	this.get = get;
}
module.exports = commit;
var self = commit.prototype;

function loadJSON(file) {
	if(fs.existsSync(file)) {
		return JSON.parse(fs.readFileSync(file));
	} else {
		return {};
	}
}

// take path string
// handle online
// read from sddc.parameters

// handle endpoint specific parameters
function get(path) {
	return new Promise(function(resolve, reject) {
		const client = new clientRest({
			username: 'admin',
			password: 'VMware1!VMware1!',
			online: 1
		});
		client.get(path).then((data) => {
			resolve(data);
		}).catch((e) => {
			reject(e);
		});
	});
}

