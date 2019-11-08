#!/usr/bin/env node
const core = require('./drv.core.js');

// constructor
module.exports = {
	run
};

function run(route) {
	return getSchemas(route);
}

function getSchemas(body) {
	let list = [];
	Object.entries(body).forEach((value) => {
		if(isOperation(value[0])) {
			getParameters(value[1]).forEach((item) => {
				list.push({
					action: value[0],
					type: 'request',
					schema: item
				});
			});
			getResponses(value[1]).forEach((item) => {
				list.push({
					action: value[0],
					type: 'response',
					schema: item
				});
			});
		}
	});
	return list;
}

function isOperation(string) { // valid api operation
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

function getResponses(body) {
	let responses, value;
	let list = [];
	if(responses = core.def(body.responses)) {
		Object.entries(responses).forEach((response) => {
			if(value = getSchema(response[1])) {
				list.push(value);
			}
		});
	}
	return list;
}

function getParameters(body) {
	let parameters, value;
	let list = [];
	if(parameters = core.def(body.parameters)) {
		parameters.forEach((p) => {
			if(value = getSchema(p)) {
				list.push(value);
			}
		});
	}
	return list;
}

function getSchema(body) {
	let schema, ref, matches;
	if(schema = core.def(body.schema)) {
		if(ref = core.def(schema['$ref'])) {
			if(matches = ref.match(/#[\/]definitions[\/](.+)/)) {
				return matches[1];
			}
		}
	}
}
