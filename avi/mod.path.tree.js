#!/usr/bin/env node
const args = process.argv;
const core = require('./mod.core');
const paths = core.loadJSON('./apispec.json').paths;

// constructor
module.exports = {
	run
};

// entry
function run(opts = {}) {
	let defaults = Object.assign({
		spec: './apispec.json'
	}, core.cleanObject(opts));
	//let paths = core.loadJSON(defaults.spec).paths;
	let cache = {};
	Object.keys(paths).sort().forEach((path) => {
		tree(cache, toCmd(path), path);
	});
	console.log(JSON.stringify(cache, null, "\t"));
}

function tree(cache, array, path) {
	let item = array.shift();
	if(typeof(cache[item]) === 'undefined') {
		cache[item] = {};
	}
	if(array.length) {
		tree(cache[item], array, path);
	} else {
		Object.keys(paths[path]).sort().forEach((action) => {
			if(isOperation(action)) {
				cache[item][action] = 1;
			}
		});
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

function toCmd(path) {
	path = path.replace(/^[/]/, "");
	path = path.replace(/[/]$/, "");
	path = path.replace(/\?/, "/?");
	path = path.replace(/=/, "/");
	let cmds = path.split('/').map((cmd) => {
		if(cmd.match(/^\{.+\}$/)) { // variable - convert {var} to var[]
			cmd = cmd.replace(/^\{/, "").replace(/\}$/, "[]");
		}
		if(cmd.match(/^\?/)) { // query - convert ?action to action?
			cmd = cmd.replace(/^\?/, "").replace(/$/, "?");
		}
		return cmd;
	});
	return cmds;
}
