#!/usr/bin/env node
const fs = require('fs');
const qc = require('./query');
const q = new qc();

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;
const cyan = chalk.cyan;

//console.log(chalk.blueBright('blueBright').toString());
//console.log(chalk.blue('blue'));
//console.log('\u001B[94mTEST\u001B[39m');

// define shapes
const t = '\u251c';
const h = '\u2500';
const v = '\u2502';
const e = '\u2514';
const s = ' ';
const width = 2;
const shapes = {
	t: '\u251c',
	h: '\u2500',
	v: '\u2502',
	e: '\u2514',
	s: ' '
};
const level = {
	t: shapes.v + shapes.s.repeat(width) + ' ',
	b: shapes.t + shapes.h.repeat(width) + ' ',
	l: shapes.e + shapes.h.repeat(width) + ' ',
	s: shapes.s + shapes.s.repeat(width) + ' '
};

// called from shell
if(process.argv[1].match(/list/g)) {
	let arg = process.argv[2];
	let depth = 99;
	if(arg) {
		depth = arg;
	}
	run(depth);
}

function run(depth) {
	// load scope
	let scope = loadJSON('./ctx.scope');
	let cmdFile = loadJSON(scope.cmds);
	let cmdList = q.toCmd(scope.path);
	let body = cmdFile;
	console.log('--[ ' + blue(scope.path) + ' ]--');
	cmdList.forEach((cmd) => {
		if(cmd.match(/^\{.+\}$/)) { // variable - convert {var} to var[]
			cmd = cmd.replace(/^\{/, "").replace(/\}$/, "[]");
		}
		if(value = def(body[cmd])) {
			body = value;
		}
	});
	tree(body, [], depth, 0);
}

function def(item) {
	if(typeof(item) !== 'undefined') {
		return item;
	} else {
		return 0;
	}
}

function tree(body, array, depth, index = 0) {
	let bodyArray = Object.entries(body);
	let token = 1;
	array.push('b'); // branch
	index++;
	bodyArray.forEach((item) => {
		if(token++ < bodyArray.length) {
			console.log(getString(item[0], array));
		} else {
			array[(array.length - 1)] = 'l'; // leaf
			console.log(getString(item[0], array));
		}
		if(typeof(item[1]) === 'object' && index < depth) {
			let newarr = array.slice();
			if(newarr[newarr.length - 1] == 'l') { // leaf
				newarr[(newarr.length - 1)] = 's'; // space
			} else {
				newarr[(newarr.length - 1)] = 't'; // trunk
			}
			tree(item[1], newarr, depth, index);
		}
	});
}

function loadJSON(file) {
	if(fs.existsSync(file)) {
		return JSON.parse(fs.readFileSync(file));
	} else {
		return {};
	}
}

function getString(label, array) {
	let string = '';
	for(let i = 0; i < array.length; i++) {
		string += level[array[i]];
	}
	string += cyan(label); // colour
	return string;
}
