#!/usr/bin/env node
const core = require('./mod.core');

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
		if(isOperation(value[0])) { //action
			getParameters(value[1]).forEach((item) => {
				list.push({
					method: value[0],
					type: 'request',
					schema: item
				});
			});
			getResponses(value[1]).forEach((item) => {
				list.push({
					method: value[0],
					type: 'response',
					code: item[0],
					schema: item[1]
				});
			});
		}
	});
	return list;
}

function oldOperation(string) { // valid api operation
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

function isOperation(string) { // valid api operation
	return [
		'get',
		'put',
		'post',
		'delete',
		'options',
		'head',
		'patch',
		'trace'
	].filter((op) => {
		return op == string;
	}).length > 0;
}

function getResponses(body) {
	let responses, value;
	let list = [];
	if(responses = core.def(body.responses)) {
		Object.entries(responses).forEach((response) => { // each response
			if(value = getSchema(response[1])) {
				list.push([response[0], value]);
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
