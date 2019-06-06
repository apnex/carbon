#!/usr/bin/env node
const fs = require('fs');

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// cli switch
var params = []; // convert to a node{}?
var ids = [ // dummy ids
	'deadbeef01',
	'deadbeef02',
	'deadbeef03'
];
var index = 0;
var slurpParam = 1;

// called from shell
if(process.argv[1].match(/complete/g)) {
	let args = process.argv.slice(2);
	if(args.length > 0) {
		let cmdSpec = {};
		if(fs.existsSync(args[0])) {
			cmdSpec = JSON.parse(fs.readFileSync(args[0]));
		}
		let cmds = args.slice(1);
		let string = chain(cmds);
		console.log('--[ ' + blue(string) + ' ]--');
		run(cmds, cmdSpec, 0);
	} else {
		console.log('[' + orange('ERROR') + ']: command usage: ' + green('complete') + ' ' + blue('<cmdfile.json> [ <cmds> ... ]'));
	}
}

function run(cmds, body, slurp = 1) {
	if(index < cmds.length) {
		// command - parse
		let cmd = cmds[index++];
		// check if dynamic variable
		if(m = cmd.match(/^.+\[\]$/)) {
			// check if in body?
			if(item = body[cmd]) {
				// check if slurp parameter
				if(slurp) {
					if(index < cmds.length) {
						// parameter - extract and recurse
						params.push(cmds[index++]);
						run(cmds, item, slurp);
					} else {
						// no parameter - obtain dynamic id list
						ids.forEach((id) => { // temp hack for testing
							console.log(id);
						});
					}
				} else {
					// recurse as is
					run(cmds, item, slurp);
				}
			}
		} else {
			// no variable - recurse
			if(item = body[cmd]) {
				run(cmds, item, slurp);
			}
		}
	} else {
		// no command - print available commands
		Object.keys(body).forEach((cmd) => {
			console.log(cmd);
		});
	}
}

/*
	let cmds = path.split('/').map((cmd) => {
		if(cmd.match(/^\{.+\}$/)) { // variable - convert {var} to var[]
			cmd = cmd.replace(/^\{/, "").replace(/\}$/, "[]");
		}
		if(cmd.match(/^\?/)) { // query - convery ?action to action?
			cmd = cmd.replace(/^\?/, "").replace(/$/, "?");
		}
		return cmd;
	});
*/

function oldchain(cmds, opts) { // format context chain
	let keys = cmds.filter((key) => { // return non-blank keys
		let cmd = parseCmd(key, opts.slurp, opts.param, opts.query);
		return cmd;
	});
	let chain = '/' + keys.join('/');
	return chain;
}

function chain(cmds, slurp = 0, query = 1) { // format context chain
	let keys = [];
	cmds.forEach((key) => {
		if(key.match(/^.+\[\]$/)) { // is variable[]
			if(!slurp) { // not slurp
				keys.push(key);
			}
		} else {
			keys.push(key);
		}
	});
	let chain = '/' + keys.join('/');
	return chain;
}

function parseCmd(key, slurp = 1, param = 1, query = 1) {
	let cmd = '';
	if(key.match(/^.+\[\]$/)) {
		if(!slurp) {
			if(param) {
				cmd = '{' + key.replace(/\[\]$/, "") + '}';
			} else {
				cmd = key;
			}
		}
	} else {
		cmd = key;
	}
	/*
	if(key.match(/^\?/)) { // query - convery ?action to action?
		cmd = cmd.replace(/\?$/, "").replace(/$/, "?");
	}
	*/
	return cmd;
}
