#!/usr/bin/env node
const args = process.argv;
const merge = require('./mod.object.merge');
const schema = require('./mod.object.tree');
const core = require('./mod.core');
const definitions = core.loadJSON('../apispec.json').definitions;
const fs = require('fs');

// args
var entity = args[2];

// called from shell
if(args[1].match(/object.merge/g)) {
	run(definitions, './linked.json');
}

// entry
function run(definitions, file) {
	let cache = {};
	Object.keys(definitions).forEach((entity) => {
		let result = schema.run(entity, {
			spec: '../apispec.json',
			depth: -1
		});
		Object.entries(merge.run(result)).forEach((item) => {
			cache[item[0]] = item[1];
		});
	});
	fs.writeFileSync(file, JSON.stringify(cache, null, '\t'));
	console.log(JSON.stringify(cache, null, "\t"));
}
