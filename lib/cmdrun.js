#!/usr/bin/env node
const apiSpec = require('../spec/nsx-api-2-4.json');
//const apiSpec = require('../spec/vcenter.json');
const xtable = require('./xtable');
const fs = require('fs');
const paths = apiSpec.paths;
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
	let scope = {
		'action': args.pop(),
		'path': q.toChain(args, 0, 1),
		'query': {}
	};

	console.log('--[ ' + blue(scope.path) + ' ]--');
	fs.writeFileSync('./ctx.scope', JSON.stringify(scope, null, "\t"));
	console.log(JSON.stringify(scope, null, "\t"));

	let params = q.raw(scope);
	let pcomp = {};
	params.forEach((p) => {
		pcomp[p.name] = nested(p);
	});
	fs.writeFileSync('./ctx.query', JSON.stringify(pcomp, null, "\t"));
	q.run(args, 1);
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
