#!/usr/bin/env node
const core = require('./mod.core');

// constructor
module.exports = {
	run
};

// entry
function run(body) {
	let cache = {};
	let depth = 20;
	merge(body, undefined, cache, depth, 0);
	return cache;
}

// merge
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
