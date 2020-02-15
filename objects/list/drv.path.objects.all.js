#!/usr/bin/env node
const args = process.argv;
const schemas = require('./mod.path.objects');
const core = require('./mod.core');
const apiSpec = core.loadJSON('../apispec.json');
const paths = apiSpec.paths;
const definitions = apiSpec.definitions;
const fs = require('fs');

// called from shell
var result = [];
if(process.argv[1].match(/path.objects.all/g)) {
	Object.keys(paths).forEach((route) => {
		run(route);
	});
	fs.writeFileSync('./result.json', JSON.stringify(result, null, '\t'));
}

// run
function run(route) {
	let objects = schemas.run(paths[route]);
	objects.forEach((item) => {
		result.push({
			name: item.schema,
			type: item.type,
			method: item.method,
			code: item.code,
			route: route
		});
	});
}
