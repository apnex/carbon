#!/usr/bin/env node
const xtable = require('./xtable');
const fs = require('fs');
const qc = require('./query');
const q = new qc();

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// called from shell
if(process.argv[1].match(/cmdrun/g)) {
	let args = process.argv.slice(2);

	// buildScope
	let scope = q.buildScope(args, './new-spec.json');
	scope.cmds = './ctx.full-spec.json';

	// output
	console.log('--[ ' + blue(scope.path) + ' ]--');
	fs.writeFileSync('./ctx.scope', JSON.stringify(scope, null, "\t"));
	//console.log(JSON.stringify(scope, null, "\t"));

	// set params
	let params = q.raw(scope);
	if(typeof(params) !== 'undefined') {
		let pcomp = {};
		params.forEach((p) => {
			pcomp[p.name] = nested(p);
		});
		fs.writeFileSync('./ctx.query', JSON.stringify(pcomp, null, "\t"));
	}
	q.run(scope);
}

function nested(p) {
	let value = 1;
	if(typeof(p.enum) == "object") {
		value = {};
		p.enum.forEach((key) => {
			value[key] = 1;
		});
	}
	if(p.type == "boolean") {
		value = {
			"true": 1,
			"false": 1
		};
	}
	return value;
}
