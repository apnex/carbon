#!/usr/bin/env node
const schema = require('./mod.object.tree');
const args = process.argv;

// args
var item = args[2];
var depth = Number(args[3]);

// called from shell
if(process.argv[1].match(/object.tree/g)) {
	var result = schema.run(item, {
		spec: './apispec.json',
		depth
	});
	console.log(JSON.stringify(result, null, "\t"));
}

