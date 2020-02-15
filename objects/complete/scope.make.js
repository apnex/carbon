#!/usr/bin/env node
const args = process.argv;
const fs = require('fs');
const core = require('./mod.core');

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;
const cyan = chalk.cyan;

// called from shell
if(process.argv[1].match(/scope.make/g)) {
	if(args[2]) {
		run(args[2], args[3]);
		console.log(JSON.stringify(core.loadJSON('./state/ctx.scope'), null, "\t"));
	} else {
		console.log('[' + green('INFO') + ']: carbon [' + green('scope.make') + '] usage ' + blue('scope.make [ <spec> <tree> ]'));
		console.log(JSON.stringify(core.scope(), null, "\t"));
	}
}

function run(
	spec = './apispec.json',
	tree = './state/ctx.tree',
	object = './state/ctx.object'
) {
	if(!fs.existsSync('./state')){
		fs.mkdirSync('./state');
	}
	let scope = {
		spec,
		tree,
		object,
		action: '',
		path: '/',
		query: {}
	}
	fs.writeFileSync('./state/ctx.scope', JSON.stringify(scope, null, "\t"));
	console.log('./state/ctx.scope written');
}
