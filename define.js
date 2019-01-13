#!/usr/bin/env node
const args = process.argv;
const apiSpec = require('./nsx-api.json');
//const apiSpec = require('./vcenter.json');
var paths = apiSpec.definitions;

// cli switch
var item = args[2];
var method = args[3];
if(route = paths[item]) {
	switch(method) {
		case "read":
			resolve(route, 0, 0);
		break;
		case "write":
			resolve(route, 1, 1);
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

function resolve(spec, writeOnly, minSpec) {
	let data = {};
	let curSpec;
	if(typeof spec.allOf !== 'undefined') { // decouple recursion logic from handling
		curSpec = spec.allOf[1];
	} else {
		curSpec = spec;
	}

	// build property list
	let propList = [];
	let properties = {};
	if(typeof curSpec.required === 'undefined') {
		if(curSpec.properties) {
			propList = Object.keys(curSpec.properties);
		}
	} else {
		if(minSpec && writeOnly) {
			propList = curSpec.required;
		} else {
			propList = Object.keys(curSpec.properties);
		}
	}
	if(curSpec.properties) {
		properties = curSpec.properties;
	}

	// iterate and filter properties
	propList.sort().forEach((item) => {
		if(writeOnly) {
			if(!properties[item].readOnly) {
				data[item] = buildNode(properties[item]);
			}
		} else {
			data[item] = buildNode(properties[item]);
		}
	});
	console.log(JSON.stringify(data, null, "\t"));
}

function buildNode(item) {
	let type;
	if(typeof item.type !== 'undefined') {
		type = item.type;
	} else {
		if(typeof item['$ref'] !== 'undefined') {
			type = item['$ref'];
		}
	}
	//let node = {};
	//return node;
	return type;
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
