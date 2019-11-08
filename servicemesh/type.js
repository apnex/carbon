#!/usr/bin/env node
let args = process.argv.slice(2);

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// called from shell
var paths = {};
if(process.argv[1].match(/type/g)) {
	let specFile = args[0];
	if(specFile) {
		//console.error(specFile);
		const apiSpec = require(specFile);
		paths = apiSpec.paths;
		build(paths);
	} else {
		const apiSpec = require('./apispec.json');
		paths = apiSpec.paths;
		build(paths);
		//console.log('[' + orange('ERROR') + ']: command usage: ' + green('cmdrun') + ' ' + blue('<apispec.json>'));
	}
}

function build(paths) {
	let cache = {};
	Object.keys(paths).sort().forEach((path) => {
		tree(cache, toCmd(path), path);
	});
	console.log(JSON.stringify(cache, null, "\t"));
}

function tree(cache, array, path) {
	let item = array.shift();
	if(typeof cache[item] === 'undefined') {
		cache[item] = {};
	}
	if(array.length) {
		tree(cache[item], array, path);
	} else {
		Object.keys(paths[path]).sort().forEach((action) => {
			if(isOperation(action)) {
				cache[item][action] = 1;
			}
		});
	}
}

// validate string against schema for operation
function isOperation(string) {
	let isTrue = 0;
	[
		'get',
		'put',
		'post',
		'delete',
		'options',
		'head',
		'patch',
		'trace'
	].forEach((op) => {
		if(op == string) {
			isTrue = 1;
		}
	});
	return isTrue;
}

function toCmd(path) {
	path = path.replace(/^[/]/, "");
	path = path.replace(/[/]$/, "");
	path = path.replace(/\?/, "/?");
	path = path.replace(/=/, "/");
	let cmds = path.split('/').map((cmd) => {
		if(cmd.match(/^\{.+\}$/)) { // variable - convert {var} to var[]
			cmd = cmd.replace(/^\{/, "").replace(/\}$/, "[]");
		}
		if(cmd.match(/^\?/)) { // query - convery ?action to action?
			cmd = cmd.replace(/^\?/, "").replace(/$/, "?");
		}
		return cmd;
	});
	return cmds;
}
