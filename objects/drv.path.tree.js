#!/usr/bin/env node
const args = process.argv.slice(2);
const tree = require('./mod.path.tree');

// args
var specFile = args[0];

// called from shell
if(process.argv[1].match(/path.tree/g)) {
	var paths = {};
	tree.run({
		spec: specFile
	});
}
