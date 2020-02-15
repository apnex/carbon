#!/usr/bin/env node
const args = process.argv;
const core = require('./mod.core');

// constructor
module.exports = {
	run
};
var cache = {};

// entry
function run(item, opts = {}) {
	let defaults = Object.assign({
		spec: './apispec.json',
		raw: 0,
		writeOnly: 0,
		required: 0,
		hidden: 0,
		deprecated: 0,
		override: 0,
		chain: {},
		depth: -1 // no restriction
	}, core.cleanObject(opts));
	let definitions = getSpec(defaults.spec);
	if(route = definitions[item]) {
		if(defaults.raw) {
			return route;
		} else {
			return isRef({
				"$ref": "#/definitions/" + item
			}, defaults);
		}
	} else {
		console.error('Object: [' + item + '] does not exist!');
	}
}

function getSpec(name) {
	if(typeof(cache[name]) === 'undefined') {
		cache[name] = core.loadJSON(name).definitions;
	}
	return cache[name];
}

function isRef(body, ops) {
	let opts = JSON.parse(JSON.stringify(ops));
	let node = {};
	let flag = '';
	let matches;
	let string = body['$ref']; // why do I need whole body?
	if(matches = string.match(/#[\/]definitions[\/](.+)/)) {
		if(typeof(opts.parent) !== 'undefined') {
			opts.chain[opts.parent] = 1;
		}
		let definitions = getSpec(opts.spec);
		if(value = definitions[matches[1]]) {
			opts.parent = matches[1];
			if(opts.chain[matches[1]]) {
				opts.depth = 0;
				flag = ':circular';
			}
			if(opts.depth == 0) {
				node[string] = '$ref' + flag;
			} else {
				if(opts.depth > 0) {
					opts.depth--;
				}
				node = defTree(value, opts); // recurse
			}
		}
	}
	return node;
}

function defTree(spec, opts) {
	let data = {};
	if(typeof(spec.allOf) !== 'undefined') {
		spec.allOf.forEach((body) => { // merge all
			let node = selectType(body, opts);
			if(typeof(node) == 'object') {
				data = Object.assign(data, node);
			} else {
				data = node;
			}
		});
	} else {
		let node = selectType(spec, opts);
		if(node === Object(node) && Object.prototype.toString.call(node) !== '[object Array]') {
			data = Object.assign(data, node);
		} else {
			data = node;
		}
	}
	return data;
}

function selectType(body, opts) {
	let node = {};
	if(typeof(body.type) !== 'undefined') {
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
			case "secret":
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
	} else { // noType
		if(typeof(body['$ref']) !== 'undefined') { // isRef
			node = isRef(body, opts);
		} else {
			node = isObject(body, opts); // default?
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
		if(typeof(body.required) !== 'undefined') {
			fields = body.required;
		}
	} else {
		if(typeof(body.properties) !== 'undefined') {
			fields = Object.keys(body.properties);
		}
	}
	if(typeof(body.discriminator) !== 'undefined') {
		// do something?
		// currently broken
		// body.properties[body.discriminator].type = 'discriminator';
	}
	fields.forEach((key) => {
		let value = body.properties[key];
		if(isIncluded(key, value, opts)) {
			node[key] = selectType(value, opts);
		}
	});
	return node;
}

function isArray(body, opts) {
	let node = [{}];
	if(typeof(body['items']) !== 'undefined') {
		node = [selectType(body['items'], opts)];
	}
	return node;
}

function isString(body, opts) {
	let node = '<string>';
	if(typeof(body.enum) !== 'undefined') {
		node = body.enum;
	}
	return node;
}

function isDiscriminator(body, opts) {
	let node = "<string>";
	if(typeof(body.enum) !== 'undefined') {
		node = body.enum.map(a => ('$' + a));
	}
	return node;
}