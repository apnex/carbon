#!/usr/bin/env node
const args = process.argv;
const fs = require('fs');
const tree = require('./object.tree');
const core = require('./drv.core');

// called from shell
//console.error('args[0]: [' + args[0] + ']');
//console.error('args[1]: [' + args[1] + ']');
//console.error('filename: [' + __filename + ']');
if(process.argv[1].match(/object.find/g)) {
	if(result = tree.run(args[2])) {
		fs.writeFileSync('./state/ctx.tree', JSON.stringify(result, null, '\t'));
		run({
			spec: './apispec.json',
			tree: './state/ctx.tree',
			object: args[2]
		});
	} else {
		console.error('failed, object does not exist');
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
