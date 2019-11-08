#!/usr/bin/env node
const args = process.argv;
const fs = require('fs');
const qc = require('./query.js');
const q = new qc();
const apiSpec = require('./apispec.json');
var paths = apiSpec.definitions;

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;
const file = './state/ctx.scope';

// constructor
var self = define.prototype;
function define(opts) {
	this.options = Object.assign({}, opts);
	self.run = run;
}
module.exports = define;

// cli switch
var item = args[2];
var method = args[3];
var result;
const defaults = {
	writeOnly: 0,
	required: 0,
	hidden: 0
}
// called from shell
if(process.argv[1].match(/define/g)) {
	if(route = paths[item]) {
		switch(method) {
			case "read":
				//console.log(route.properties);
				result = isObject(route, {
					writeOnly: 0,
					required: 0
				});
				console.log(JSON.stringify(result, null, "\t"));
			break;
			case "readHidden":
				result = defTree(route, {
					writeOnly: 0,
					required: 0,
					hidden: 1,
					deprecated: 1
				});
				console.log(JSON.stringify(result, null, "\t"));
			break;
			case "write":
				result = defTree(route, {
					writeOnly: 1,
					required: 0
				});
				console.log(JSON.stringify(result, null, "\t"));
			break;
			case "writeMin":
				result = defTree(route, {
					writeOnly: 1,
					required: 1
				});
				console.log(JSON.stringify(result, null, "\t"));
			break;
			default:
				console.log(JSON.stringify(route, null, "\t"));
			break;
		}
	} else {
		run();
	}
}

function run() {
	let scope = {
		'path': '/'
	};
	if(fs.existsSync(file)) {
		scope = loadJSON(file);
	}
	let cmds = scope.path.split('/');
	cmds.shift();
	let string = q.toChain(cmds, 0, 0);
	//console.error('--[ ' + blue(string) + ' ]--');

	let list = loadJSON(scope.spec).paths;
	let results = filterList(string, Object.keys(list));
	let cache = {};
	results.forEach((value) => {
		getSchemas(list[value], cache);
	});

	return toCmd(Object.keys(cache).sort());
}

function getSchemas(body, cache) {
	getParameters(body).forEach((item) => {
		cache[item] = 1;
	});
	Object.entries(body).forEach((value) => {
		if(isOperation(value[0])) {
			getResponses(value[1]).forEach((item) => {
				cache[item] = 1;
			});
			getParameters(value[1]).forEach((item) => {
				cache[item] = 1;
			});
		}
	});
}

function getResponses(body) {
	let responses, schema, ref, matches;
	let list = [];
	if(responses = def(body.responses)) {
		Object.entries(responses).forEach((response) => {
			if(value = getSchema(response[1])) {
				//console.log(value);
				list.push(value);
			}
		});
	}
	return list;
}

function getSchema(body) {
	if(schema = def(body.schema)) {
		if(ref = def(schema['$ref'])) {
			if(matches = ref.match(/#[\/]definitions[\/](.+)/)) {
				return matches[1];
			}
		}
	}
}

function getParameters(body) {
	let list = [];
	if(params = def(body.parameters)) {
		params.forEach((p) => {
			if(value = getSchema(p)) {
				//console.log(value);
				list.push(value);
			}
		});
	}
	return list;
}

function def(item) {
	if(typeof(item) !== 'undefined') {
		return item;
	} else {
		return 0;
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

function filterList(string, list) {
	let rgx = new RegExp('^' + string, 'g');
	return list.sort().filter((value) => {
		return rgx.exec(value);
	});
}

function loadJSON(file) {
	if(fs.existsSync(file)) {
		return JSON.parse(fs.readFileSync(file));
	} else {
		return {};
	}
}

function toCmd(list) {
	let cmdTree = {};
	let actions = {
		'read': 1,
		'readHidden': 1,
		'write': 1,
		'writeMin': 1
	};
	list.sort().forEach((value) => {
		cmdTree[value] = actions;
	});
	return cmdTree;
}

function defTree(spec, opts) {
	let data = {};
	if(typeof spec.allOf !== 'undefined') {
		spec.allOf.forEach((body) => { // merge all
			let node = selectType(body, opts);
			if(typeof(node) == 'Object') {
				data = Object.assign(data, node);
			} else {
				data = node;
			}
		});
	} else {
		let node = selectType(spec, opts);
		if(typeof(node) == 'Object') {
			data = Object.assign(data, node);
		} else {
			data = node;
		}
	}
	return data;
}

function selectType(body, opts) {
	let node = {};
	if(typeof body.type !== 'undefined') {
		switch(body.type) {
			case "object":
				node = isObject(body, opts);
			break;
			case "array":
				node = isArray(body, opts);
			break;
			case "string":
				node = isString(body, opts);
			break;
			case "integer":
				node = '<integer>';
			break;
			case "boolean":
				node = '<boolean>';
			break;
			case "discriminator":
				node = isDiscriminator(body, opts);
			break;
		}
	} else { // isRef
		if(typeof body['$ref'] !== 'undefined') {
			node = isRef(body, opts);
		}
	}
	return node;
}

function isIncluded(key, body, opts) {
	let include = 1;
	if(!opts.hidden && key.match(/^_/)) { // hidden fields
		include = 0;
	}
	if(opts.writeOnly && body['readOnly']) { // isReadOnly
		include = 0;
	}
	if(!opts.deprecated && body['x-deprecated']) { // deprecated
		include = 0;
	}
	return include;
}

function isObject(body, opts) {
	let node = {};
	let fields = [];
	if(opts.required) {
		if(typeof body.required !== 'undefined') {
			fields = body.required;
		}
	} else {
		if(typeof body.properties !== 'undefined') {
			fields = Object.keys(body.properties);
		}
	}

	if(typeof body.discriminator !== 'undefined') {
		// do something?
		body.properties[body.discriminator].type = 'discriminator';
	}

	fields.forEach((key) => {
		let value = body.properties[key];
		if(isIncluded(key, value, opts)) {
			node[key] = selectType(value, opts);
		}
	});
	return node;
}

function isRef(body, opts) {
	let node = {};
	let matches;
	let string = body['$ref'];
	if(matches = string.match(/#[\/]definitions[\/](.+)/)) {
		if(value = paths[matches[1]]) {
			node = defTree(value, opts); // recurse
		}
	}
	return node;
}

function isArray(body, opts) {
	let node = [{}];
	if(typeof body['items'] !== 'undefined') {
		node = [selectType(body['items'], opts)];
	}
	return node;
}

function isString(body, opts) {
	let node = '<string>';
	if(typeof body.enum !== 'undefined') {
		node = body.enum;
	}
	return node;
}

function isDiscriminator(body, opts) {
	let node = "<string>";
	if(typeof body.enum !== 'undefined') {
		node = body.enum.map(a => ('$' + a));
	}
	return node;
}

function filter(value) {
	// construct input
	let data = [];
	Object.keys(paths).sort().forEach((value) => {
		data.push({
			key: value
		});
	});

	// filter and print
	const xcell = require('./xcell.js');
	cell = new xcell({
		data: data
	});
	cell.addFilter({
		'field': 'key',
		'value': value
	});
	cell.run().forEach((item) => {
		console.log('object [' + item.key + ']');
	});
}
