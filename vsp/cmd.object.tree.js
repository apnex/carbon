#!/usr/bin/env node
const args = process.argv;
const tree = require('./mod.object.tree');
const core = require('./mod.core');
const scope = core.scope();

// args
var item = scope.object;
var depth = Number(args[2]);

// called from shell
if(process.argv[1].match(/object.tree/g)) {
	var result = tree.run(item, {
		spec: scope.spec,
		depth
	});
	console.log(JSON.stringify(result, null, "\t"));
}

