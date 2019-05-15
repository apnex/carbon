#!/usr/bin/env node
let args = process.argv;
//const apiSpec = require('../spec/nsx-api.json');
const apiSpec = require('../spec/nsx-api-2-4.json');
//const apiSpec = require('../spec/vcenter.json');
const paths = apiSpec.paths;

// cli switch
var item = args[2];
var method = args[3];
nested(paths);

function nested(paths) {
	let cache = {};
	Object.keys(paths).sort().forEach((path) => {
		let matches = path.replace(/^[/]/, "").split('/');
		tree(cache, matches, path);
	});
	console.log(JSON.stringify(cache, null, "\t"));
	// split into another function for individual path
}

function tree(cache, array, path) {
	let item = array.shift();
	if(!item.match(/\?/g)) { // exclude query params
		if(typeof cache[item] === 'undefined') {
			cache[item] = {};
		}
		if(array.length) {
			tree(cache[item], array, path);
		} else {
			//console.log(path);
			Object.keys(paths[path]).sort().forEach((action) => {
				cache[item][action] = 1;
			});
		}
	}
}
