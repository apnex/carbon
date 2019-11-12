#!/usr/bin/env node
const args = process.argv;
const tree = require('./mod.tree');
const core = require('./mod.core');
const scope = core.scope();

// args
var depth = Number(args[2]);

// called from shell
if(process.argv[1].match(/tree/g)) {
	tree.run({
		tree: scope.tree,
		depth
	});
}

