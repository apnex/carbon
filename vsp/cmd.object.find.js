#!/usr/bin/env node
const args = process.argv;
const fs = require('fs');
const tree = require('./mod.object.tree');
const core = require('./mod.core');

// called from shell
if(process.argv[1].match(/object.find/g)) {
	if(result = tree.run(args[2])) {
		fs.writeFileSync('./state/ctx.tree', JSON.stringify(result, null, '\t'));
		run({
			spec: './apispec.json',
			tree: './state/ctx.tree',
			object: args[2]
		});
	} else {
		console.error('failed, object [' + args[2] + '] does not exist');
	}
}

// run
function run(opts) {
	let scope = {
		spec: opts.spec,
		tree: opts.tree,
		object: opts.object,
		action: '',
		path: '/',
		query: {}
	}
	fs.writeFileSync('./state/ctx.scope', JSON.stringify(scope, null, "\t"));
}
