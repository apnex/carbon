#!/usr/bin/env node
const fs = require('fs');
const xtable = require('./xtable');
const apiSpec = require('../spec/nsx-api-2-4.json');
const paths = apiSpec.paths;

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

// called from shell
if(process.argv[1].match(/chain/g)) {
	let cmds = process.argv.splice(2);
	let string = toChain(cmds, 0, 1, 1);
	console.log('--[ ' + blue(string) + ' ]--');

	let news = toCmd(string);
	news.forEach((cmd) => {
		console.log(':: ' + cmd);
	});

	string = toChain(news, 0, 1, 1);
	console.log('--[ ' + blue(string) + ' ]--');
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

function def(item) {
	if(typeof(item) !== 'undefined') {
		return item;
	} else {
		return 0;
	}
}

function toChain(args, slurp = 1, param = 1, setQuery = 1) { // format context chain
	let chain = '';
	if(args.length > 0) {
		let query = 0;
		let inquery = 0;
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
					if(inquery) {
						chain += '&' + key.replace(/\?$/, "");
					} else {
						chain += '?' + key.replace(/\?$/, "");
					}
					inquery = 1;
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

// get uri from query chain '?'
// split uri on '/'
// split query chain on pairs '&'
// split pairs into key/value '='

function oldCmd(path) {
	path = path.replace(/^[/]/, "");
	path = path.replace(/^\?/, "/?");
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
