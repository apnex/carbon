#!/usr/bin/env node
const args = process.argv;
const tree = require('./mod.tree');
const core = require('./mod.core');
const fs = require('fs');
const definitions = core.loadJSON('../apispec.json').definitions;

// args
var entity = args[2];
var depth = Number(args[3]);

// called from shell
if(args[1].match(/merge/g)) {
	let result = run(core.loadJSON('./tree.json'));
	console.log(JSON.stringify(result, null, "\t"));
}

// entry
function run(body) {
	let depth = 10;
	let cache = {};
	merge(body, undefined, cache, depth, 0);
	return cache;
}

function merge(body, parent, cache, depth, index = 0) {
	let keys = Object.keys(body);
	keys.forEach((key) => {
		if(item = core.def(cache[key])) {
			if(typeof(parent) !== 'undefined') {
				cache[key].push(parent);
			}
		} else {
			if(typeof(parent) !== 'undefined') {
				cache[key] = [ parent ];
			} else {
				cache[key] = [];
			}
			if(index++ <= depth) {
				merge(body[key], key, cache, depth, index);
			}
		}
	});
}
