#!/usr/bin/env node
const fs = require('fs');
const xtable = require('./xtable');
const apiSpec = require('../spec/nsx-api-2-4.json');
const paths = apiSpec.paths;

/*
-- Parse and structure all parameter items listed under a single API call
-- Default table display
*/

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// constructor
var self = query.prototype;
function query(opts) {
	this.options = Object.assign({}, opts);
	self.run = run;
	self.chain = chain;
}
module.exports = query;

// called from shell
if(process.argv[1].match(/query/g)) {
	let string = fs.readFileSync('./ctx.scope').toString();
	let cmds = string.split('/');
	cmds.shift();
	let arg = process.argv[2];
	console.log('--[ ' + blue(string) + ' ]--');
	/*switch(arg) {
		case 'raw':
			cmds[cmds.length - 1] = 'raw';
		break;
	}*/
	if(arg == "raw") {
		raw(cmds, 1);
	} else {
		run(cmds, 1, arg);
	}
}

function run(cmds, slurp = 1, arg) {
	let action = cmds.pop();
	let path = chain(cmds, 0, 1);
	getAction(path, action, arg);
}

function getAction(path, action, arg) {
	console.log(path + ':' + action);
	if(item = def(paths[path])) {
		if(params = def(item[action]).parameters) {
			display(params, arg);
		} else {
			console.log(JSON.stringify(item, null, "\t"));
		}
	}
}

function raw(cmds, slurp = 1) {
	let action = cmds.pop();
	let path = chain(cmds, 0, 1);
	console.log(path + ':' + action);
	if(item = def(paths[path])) {
		if(params = def(item[action]).parameters) {
			console.log(JSON.stringify(params, null, "\t"));
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
		let query = 0;
		args.forEach((key) => {
			let check = 0;
			if(key.match(/^.+\[\]$/)) {
				if(param) {
					key = '{' + key.replace(/\[\]$/, "") + '}';
				}
				if(!slurp) {
					chain += '/' + key;
				}
				check = 1;
			}
			if(key.match(/^.+\?$/)) {
				key = key.replace(/\?$/, "");
				chain += '?' + key;
				check = 1;
				query = 1;
			}
			if(!check) {
				if(query) {
					chain += '=' + key;
					query = 0;
				} else {
					chain += '/' + key;
				}
			}
		});
	} else {
		chain = '/';
	}
	return chain;
}

// display table
function display(array, string) {
	let data = [];
	array.forEach((i) => {
		let schema, menum;
		if(item = def(i['schema'])) {
			schema = def(item['$ref']);
		}
		if(item = def(i['enum'])) {
			menum = item.length;
		}
		data.push({
			'name': i['name'],
			'type': i['type'],
			'schema': schema,
			'enum': menum,
			'in': i['in'],
			'required': i['required'],
			'default': i['default'],
			'format': i['format']
		});
	});
	let table = getTable(data, string);
	table.out([
		'name',
		'type',
		'in',
		'enum',
		'schema',
		'format',
		'default',
		'required'
	]);
	console.error('[ ' + table.view.length + '/' + table.data.length + ' ] entries - filter [ ' + table.filterString() + ' ]');
}

function oldDisplay(array) {
	let data = [];
	array.forEach((i) => {
		let schema, menum;
		if(item = def(i['schema'])) {
			schema = def(item['$ref']);
		}
		if(item = def(i['enum'])) {
			menum = item.length;
		}
		data.push({
			'name': i['name'],
			'type': i['type'],
			'schema': schema,
			'enum': menum,
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
		'enum',
		'schema',
		'format',
		'default',
		'required'
	]);
	console.error('[ ' + table.view.length + '/' + table.data.length + ' ] entries - filter [ ' + table.filterString() + ' ]');
}

function getTable(data, string) {
	let table = new xtable({data});
	/*table.addMap('download', function(item) { // return table object?;
		if(typeof(item) === 'object') {
			return 'yes';
		} else {
			return 'no';
		}
	});*/
	table.buildFilters(string);
	table.run();
	return table;
}
