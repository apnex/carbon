#!/usr/bin/env node
const fs = require('fs');
const xtable = require('./xtable.js');

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
const file = './state/ctx.scope';

// constructor
var self = query.prototype;
function query(opts) {
	this.options = Object.assign({}, opts);
	self.run = run;
	self.raw = raw;
	self.toChain = toChain;
	self.toCmd = toCmd;
	self.buildScope = buildScope;
}
module.exports = query;

// called from shell
if(process.argv[1].match(/query/g)) {
	let scope = {
		'path': '/'
	};
	if(fs.existsSync(file)) {
		scope = loadJSON(file);
	}
	let cmds = scope.path.split('/');
	cmds.shift();
	let arg = process.argv[2];
	console.error('--[ ' + blue(toChain(cmds, 0, 0)) + ' ]--');
	if(arg == "raw") {
		console.log(JSON.stringify(raw(scope), null, "\t"));
	} else {
		run(scope);
	}
}

function run(scope) {
	if(body = raw(scope)) {
		display(body);
	} else {
		console.log(JSON.stringify(scope, null, "\t"));
	}
}

function raw(scope) {
	let paths = loadJSON(scope.spec).paths;
	if(def(paths)) {
		if(item = getOperation(scope.path, paths)) {
			if(body = def(item[scope.action]).parameters) {
				// no params?
				return body;
			} else {
				return item;
			}
		}
	}
}

function getOperation(string, paths) {
	let body;
	if(item = def(paths[string])) {
		body = item;
	}
	if(item = def(paths[string + '/'])) {
		body = item;
	}
	return body;
}

function loadJSON(file) {
	if(fs.existsSync(file)) {
		return JSON.parse(fs.readFileSync(file));
	} else {
		return {};
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

function buildScope(args, spec) {
	let action = '';
	let path = toChain(args, 0, 1);
	let paths = loadJSON(spec).paths;
	if(item = getOperation(path, paths)) {
		if(def(item['get'])) {
			action = 'get';
		}
	} else {
		let naction = args[args.length - 1];
		path = toChain(args.slice(0, -1), 0, 1);
		if(item = getOperation(path, paths)) {
			if(def(item[naction])) {
				action = naction;
			} else {
				if(def(item['get'])) {
					action = 'get';
				}
			}
		}
	}
	return {
		spec: spec,
		action: action,
		path: path,
		query: {}
	};
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
	/*table.addMap('required', function(item) { // return table object?;
		if(item == 'true') {
			return 'true';
		} else {
			return 'false';
		}
	});*/
	table.buildFilters(string);
	table.run();
	return table;
}
