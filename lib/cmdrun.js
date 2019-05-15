#!/usr/bin/env node
const apiSpec = require('../spec/nsx-api-2-4.json');
const paths = apiSpec.paths;

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// called from shell
if(process.argv[1].match(/cmdrun/g)) {
	let args = process.argv.slice(2);
	let string = chain(args, 1);
	console.log('--[ ' + blue(string) + ' ]--');
	run(args, 1);
}

function run(cmds, slurp = 1) {
	let action = cmds.pop();
	let path = chain(cmds, 0, 1);
	getAction(path, action);
}

function getAction(path, action) {
	//console.log(path);
	if(item = paths[path]) {
		console.log(JSON.stringify(item[action], null, "\t"));
	}
}

function chain(args, slurp = 1, param = 0) { // format context chain
	let chain = '';
	if(args.length > 0) {
		args.forEach((key) => {
			if(key.match(/^.+\[\]$/)) {
				if(param) {
					key = '{' + key.replace(/\[\]$/, "") + '}';
				}
				if(!slurp) {
					chain += '/' + key;
				}
			} else {
				chain += '/' + key;
			}
		});
	} else {
		chain = '/';
	}
	return chain;
}
