#!/usr/bin/env node
//const clientLocal = require('./drv.client.local');
//const clientRest = require('./drv.client.rest');
//const clientRest = require('./drv.vsp.client');
const clientRest = require('./drv.client.nsx');

// called from shell
if(process.argv[1].match(/drv.core/g)) {
	let args = process.argv.slice(2);
	if(args.length > 0) {
		get(args[0]).then((data) => {
			console.log(JSON.stringify(data, null, "\t"));
		}).catch((e) => {
			//console.error(e);
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

// take path string
// handle online
// read from sddc.parameters

// handle endpoint specific parameters
function get(path) {
	return new Promise(function(resolve, reject) {
		/*
		const client = new clientRest({
			username: 'administrator@vsphere.local',
			password: 'VMware1!',
			online: 1
		});
		*/
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

