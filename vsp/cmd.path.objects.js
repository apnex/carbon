#!/usr/bin/env node
const args = process.argv;
const schemas = require('./mod.path.objects');
const core = require('./mod.core');
const scope = core.scope();
const apiSpec = core.loadJSON(scope.spec);
const paths = apiSpec.paths;
const definitions = apiSpec.definitions;

// called from shell
if(process.argv[1].match(/path.objects/g)) {
	if(route = paths[args[2]]) {
		run(route);
	} else {
		console.log('path: ' + args[2] + ' does not exist!');
	}
}

// run
function run(route) {
	let objects = schemas.run(route);
	console.log(JSON.stringify(objects, null, "\t"));
}
