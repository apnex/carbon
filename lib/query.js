#!/usr/bin/env node
const fs = require('fs');
const xtable = require('./xtable');
const apiSpec = require('../spec/nsx-api-2-4.json');
const paths = apiSpec.paths;

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// called from shell
if(process.argv[1].match(/query/g)) {
	//let args = process.argv.slice(2);
	let string = fs.readFileSync('./ctx.scope').toString();
	let args = string.split('/');
	args.shift();
	let cmd = process.argv[2];
	console.log('--[ ' + blue(string) + ' ]--');
	switch(cmd) {
		case 'raw':
			args[args.length - 1] = 'raw';
		break;
	}
	run(args, 1);
}

function run(cmds, slurp = 1) {
	let action = cmds.pop();
	let path = chain(cmds, 0, 1);
	getAction(path, action);
}

function getAction(path, action) {
	console.log(path + ':' + action);
	if(item = def(paths[path])) {
		if(params = def(item[action]).parameters) {
			display(params);
		} else {
			console.log(JSON.stringify(item, null, "\t"));
		}
	}
}

function def(item) {
	if(typeof(item) !== 'undefined') {
		return item;
	} else {
		return 0;
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

// display table
function display(array) {
	let data = [];
	array.forEach((i) => {
		data.push({
			'name': i['name'],
			'type': i['type'],
			'schema': i['schema']['$ref'],
			'in': i['in'],
			'required': i['required'],
			'default': i['default'],
			'format': i['format']
		});
	});
	let table = new xtable({data});
	table.out([
		'name',
		'type',
		'in',
		'format',
		'default',
		'schema',
		'required'
	]);
	console.error('[ ' + table.view.length + '/' + table.data.length + ' ] entries - filter [ ' + table.filterString() + ' ]');
}

