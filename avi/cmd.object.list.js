#!/usr/bin/env node
const args = process.argv;
const core = require('./mod.core');
const scope = core.scope();
const schema = core.loadJSON(scope.spec).definitions;

// called from shell
if(process.argv[1].match(/object.list/g)) {
	console.log('-- [ / ] --');
	filter(args[2]).forEach((value) => {
		console.log(value);
	});
}

// filter
function filter(value) {
	// construct input
	let data = [];
	Object.keys(schema).sort().forEach((value) => {
		data.push({
			key: value
		});
	});
	// filter and return
	const xcell = require('./xcell.js');
	cell = new xcell({
		data: data
	});
	cell.addFilter({
		'field': 'key',
		'value': value
	});
	return cell.run().map(x => x.key);
}
