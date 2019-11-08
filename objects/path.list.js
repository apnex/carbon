#!/usr/bin/env node
const args = process.argv;
const core = require('./drv.core');
const scope = core.scope();
const apiSpec = core.loadJSON(scope.spec);
const schema = apiSpec.paths;

// called from shell
if(process.argv[1].match(/path.list/g)) {
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
