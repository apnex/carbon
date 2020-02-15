#!/usr/bin/env node
const core = require('./mod.core');

// constructor
module.exports = {
	run
};

function run(body) {
	return getSchemas(body);
}

function getSchemas(body) {
	let list = [];
	Object.entries(body).forEach((value) => {
		if(isOperation(value[0])) { // action
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
	let schema, ref;
	if(schema = core.def(body.schema)) {
		if((ref = core.def(schema['items'])) && schema.type == "array") {
			return isRef(ref);
		} else {
			return isRef(schema);
		}
	}
}

function isRef(body) {
	if(ref = core.def(body['$ref'])) {
		if(matches = ref.match(/#[\/]definitions[\/](.+)/)) {
			return matches[1];
		}
	}
}
