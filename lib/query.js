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
	self.raw = raw;
	self.toChain = toChain;
}
module.exports = query;

// called from shell
if(process.argv[1].match(/query/g)) {
	let scope = {
		'path': '/'
	};
	if(fs.existsSync('./ctx.scope')) {
		scope = JSON.parse(fs.readFileSync('./ctx.scope'));
	}
	//console.log(scope.path + '::' + scope.action);
	let cmds = scope.path.split('/');
	cmds.shift();
	let arg = process.argv[2];
	console.error('--[ ' + blue(toChain(cmds, 0, 0)) + ' ]--');
	/*switch(arg) {
		case 'raw':
			cmds[cmds.length - 1] = 'raw';
		break;
	}*/
	/*
	if(arg == "raw") {
		raw(cmds, 1);
	} else {
		run(cmds,  arg);
	}
	*/
	if(arg == "raw") {
		console.log(JSON.stringify(raw(scope), null, "\t"));
	} else {
		run(scope);
	}
}

function run(scope) {
	//let action = cmds.pop();
	//let path = toChain(cmds, 0, 0);
	if(item = def(paths[scope.path])) {
		if(params = def(item[scope.action]).parameters) {
			display(params);
		} else {
			console.log(JSON.stringify(item, null, "\t"));
		}
	}
}

function raw(scope) {
	//let path = chain(cmds, 0, 1);
	let params = [];
	if(item = def(paths[scope.path])) {
		if(params = def(item[scope.action]).parameters) {
			return params;
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

function toCmd(string) {
	const url = require('url');
	let parts = url.parse(string, true)
	let cmds = parts.pathname.split('/');
	cmds.shift();
	Object.entries(parts.query).forEach((item) => {
		cmds.push(item[0] + '?');
		cmds.push(item[1]);
	});
	return cmds;
}

function def(item) {
	if(typeof(item) !== 'undefined') {
		return item;
	} else {
		return 0;
	}
}

function toChain(args, slurp = 1, param = 1, setQuery = 1) { // format context chain
	let chain = '';
	if(args.length > 0) {
		let query = 0;
		let inQuery = 0;
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
				if(setQuery) {
					if(inQuery) {
						chain += '&' + key.replace(/\?$/, "");
					} else {
						chain += '?' + key.replace(/\?$/, "");
						inQuery = 1;
					}
				} else {
					chain += '/' + key;
				}
				query = 1;
				check = 1;
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
function display(array) {
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
	let table = getTable(data);
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