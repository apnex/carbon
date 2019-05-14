#!/usr/bin/env node
const core = require('./drv.core');
const xtable = require('./xtable.js'); // view

/* Module Purpose
-- Takes space delimited shell arguments and converts to path
-- Calls drv.core with path to retrieve data
-- Displays data as raw or in tabular form view
*/

// shell
let args = process.argv.slice(2);
if(args.length > 1) {
	run(args);
}

// display chain + action
function run(args) {
	let chain = '';
	let action = args.pop();
	args.forEach((key) => {
		if(!key.match(/^.+\[\]$/)) {
			chain += '/' + key;
		}
	});
	console.error('--[ ' + chain + ' ]--');
	console.error('ACTION: ' + action);
	get(chain, action);
}

// retrieve data and select output
function get(chain, action) {
	const client = new core();
	client.get(chain).then((data) => {
		switch(action) {
			case "raw":
				console.log(JSON.stringify(data, null, "\t"));
			break;
			case "get":
				display(data);
			break;
		}
	}).catch((e) => {
		console.error(e);
	});
}

// display table
function display(raw) {
	let data = [];
	raw.results.forEach((i) => {
		data.push({
			'id': i.id,
			'display_name': i.display_name,
			'resource_type': i.resource_type
		});
	});
	let table = new xtable({data});
	table.out([
		'id',
		'display_name',
		'resource_type'
	]);
	console.error('[ ' + table.view.length + '/' + table.data.length + ' ] entries - filter [ ' + table.filterString() + ' ]');
}
