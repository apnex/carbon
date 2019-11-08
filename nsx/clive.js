#!/usr/bin/env node
const xtable = require('./xtable.js');
const fs = require('fs');
const qc = require('./query.js');
const q = new qc();
const dc = require('./define.js');
const define = new dc();

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// called from shell
if(process.argv[1].match(/clive/g)) {
	let args = process.argv.slice(2);

	// buildScope
	let scope = q.buildScope(args, './apispec.json');
	scope.cmds = './state/ctx.path';

	// output
	console.log('--[ ' + blue(scope.path) + ' ]--');
	fs.writeFileSync('./state/ctx.scope', JSON.stringify(scope, null, "\t"));
	//console.log(JSON.stringify(scope, null, "\t"));

	// set params
	let params = def(q.raw(scope));
	if(fs.existsSync('./state/ctx.query')) {
		fs.unlinkSync('./state/ctx.query');
	}
	if(typeof(params) !== 'undefined') {
		//console.log(JSON.stringify(params, null, "\t"));
		let pcomp = {};
		params.forEach((p) => {
			pcomp[p.name] = nested(p);
		});
		fs.writeFileSync('./state/ctx.query', JSON.stringify(pcomp, null, "\t"));
	}

	// set define
	let schemas = def(define.run());
	if(fs.existsSync('./state/ctx.define')) {
		fs.unlinkSync('./state/ctx.define');
	}
	if(typeof(schemas) !== 'undefined') {
		//console.log(JSON.stringify(schemas, null, "\t"));
		fs.writeFileSync('./state/ctx.define', JSON.stringify(schemas, null, "\t"));
	}
	//q.run(scope);
}

function def(item) {
	if(typeof(item) !== 'undefined') {
		return item;
	}
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
