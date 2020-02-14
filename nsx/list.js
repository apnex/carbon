#!/usr/bin/env node
const args = process.argv;
const tree = require('./mod.tree');
const core = require('./mod.core');
const fs = require('fs');
const qc = require('./query.js');
const q = new qc();

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;
const cyan = chalk.cyan;

// inputs
var depth = Number(args[2]);

// called from shell
if(args[1].match(/list/g)) {
	let scope = core.scope();
	let cmdFile = core.loadJSON(scope.cmds);
	let cmdList = q.toCmd(scope.path);
	let body = cmdFile;
	console.log('--[ ' + blue(scope.path) + ' ]--');
	cmdList.forEach((cmd) => {
		if(cmd.match(/^\{.+\}$/)) { // variable - convert {var} to var[]
			cmd = cmd.replace(/^\{/, "").replace(/\}$/, "[]");
		}
		if(value = core.def(body[cmd])) {
			body = value;
		}
	});
	tree.run({
		tree: './tree.json',
		body,
		depth
	});
}
