#!/usr/bin/env node
const args = process.argv;
const xtable = require('./xtable.js'); // view
const core = require('./mod.core');

/* Module Purpose
To provide a cli interface for the vmw-api module.
To parse stdin input from user, structure syntac and execute api calls in valid format.
To cleanly display output to user via stdout
To perform any view specific data transforms
*/

// called from shell
if(args[1].match(/cli/g)) {
	switch(args[2]) {
		case 'find':
			find(args[3]);
		break;
		default:
			console.log('No command specified [list, index, refresh, find, get, json]');
	}
}

// build, filter and output table to stdout
function find(string) {
	filter(string).then((table) => {
		table.out([
			'name',
			'type',
			'method',
			'code',
			'route'
		]);
		// table.filterText();
	});
}

// load files and filter table
function filter(string) {
	return new Promise((resolve, reject) => {
		let table = new xtable({
			data: core.loadJSON('./result.json'),
			column: 'schema'
		});
		table.buildFilters(string);
		table.run();
		resolve(table);
	});
}
