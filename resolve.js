#!/usr/bin/env node
const args = process.argv;
const apiSpec = require('./nsx-api.json');
//const apiSpec = require('./vcenter.json');
var paths = apiSpec.definitions;

// cli switch
var item = args[2];
var method = args[3];
var result;
if(route = paths[item]) {
	switch(method) {
		case "read":
			result = defTree(route, 0, 0);
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "write":
			result = defTree(route, 1, 1);
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "writefull":
			resolve(route, 1, 0);
		break;
		default:
			console.log(JSON.stringify(route, null, "\t"));
		break;
	}
} else {
	filter(item);
}

function defTree(body, writeOnly) {
	let node = {};
	if(typeof body.allOf !== 'undefined') {
		body.allOf.forEach((item) => { // merge all
			node = Object.assign(node, selectType(item, writeOnly));
		});
	} else {
		node = selectType(body, writeOnly);
	}
	return node;
}

function selectType(body, writeOnly) {
	let node = {};
	if(typeof body.type !== 'undefined') {
		//console.log(JSON.stringify(body, null, "\t"));
		switch(body.type) {
			case "object":
				node = isObject(body, writeOnly);
			break;
			case "array":
				node = isArray(body, writeOnly);
			break;
			case "integer":
				node = 'integer';
			break;
			case "uri":
				node = 'uri';
			break;
			case "string":
				node = 'string';
			break;
			case "boolean":
				node = 'boolean';
			break;
		}
	} else { // isRef
		if(typeof body['$ref'] !== 'undefined') {
			node = isRef(body, writeOnly);
		}
	}
	return node;
}

function isObject(body, writeOnly) {
	let node = {};
	Object.entries(body.properties).forEach((keys) => {
		if(isIncluded(keys[0], keys[1], writeOnly)) {
			node[keys[0]] = selectType(keys[1], writeOnly);
		}
	});
	return node;
}

function isArray(body, writeOnly) {
	let node = [];
	if(typeof body['items'] !== 'undefined') {
		node.push(selectType(body['items'], writeOnly));
	}
	return node;
}

function isRef(body, writeOnly) {
	let node = {};
	let matches;
	if(matches = body['$ref'].match(/#[\/]definitions[\/](.+)/)) {
		if(route = paths[matches[1]]) {
			node = defTree(route, writeOnly); // recurse
		}
	}
	return node;
}

function isIncluded(key, body, writeOnly) {
	let include = 1;
	if(key.match(/^_/)) { // leading underscore hidden field
		include = 0;
	}
	if(body['readOnly'] && writeOnly == 1) { // isReadOnly
		include = 0;
	}
	if(body['x-deprecated']) { // deprecated
		include = 0;
	}
	return include;
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
		console.log('key [' + item.key + ']');
	});
}
