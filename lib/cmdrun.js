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
	let string = q.chain(args, 0);
	console.log('--[ ' + blue(string) + ' ]--');
	fs.writeFileSync('./ctx.scope', string);
	q.run(args, 1);
}
