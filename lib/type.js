#!/usr/bin/env node
let args = process.argv;
const apiSpec = require('../spec/nsx-api-2-4.json');
//const apiSpec = require('../spec/vcenter.json');
const paths = apiSpec.paths;

// cli switch
nested(paths);

function nested(paths) {
	let cache = {};
	Object.keys(paths).sort().forEach((path) => {
		tree(cache, toCmd(path), path);
	});
	console.log(JSON.stringify(cache, null, "\t"));
}

function tree(cache, array, path) {
	let item = array.shift();
	if(typeof cache[item] === 'undefined') {
		cache[item] = {};
	}
	if(array.length) {
		tree(cache[item], array, path);
	} else {
		Object.keys(paths[path]).sort().forEach((action) => {
			cache[item][action] = 1;
		});
	}
}

function toCmd(path) {
	path = path.replace(/^[/]/, "");
	path = path.replace(/\?/, "/?");
	path = path.replace(/=/, "/");
	let cmds = path.split('/').map((cmd) => {
		if(cmd.match(/^\{.+\}$/)) { // variable - convert {var} to var[]
			cmd = cmd.replace(/^\{/, "").replace(/\}$/, "[]");
		}
		if(cmd.match(/^\?/)) { // query - convery ?action to action?
			cmd = cmd.replace(/^\?/, "").replace(/$/, "?");
		}
		return cmd;
	});
	return cmds;
}

function chain(cmds, slurp = 1, param = 0) { // format context chain
	let chain = '';
	if(cmds.length > 0) {
		cmds.forEach((key) => {
			if(key.match(/^.+\[\]$/)) {
				if(param) {
					key = '{' + key.replace(/\[\]$/, "") + '}';
				}
				if(!slurp) {
					chain += '/' + key;
				}
			} else {
				chain += '/' + key;
			}
		});
	} else {
		chain = '/';
	}
	return chain;
}
