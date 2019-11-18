#!/usr/bin/env node
const args = process.argv;
const schemas = require('./mod.path.objects');
const core = require('./mod.core');
const scope = core.scope();
const apiSpec = core.loadJSON(scope.spec);
const paths = apiSpec.paths;
const definitions = apiSpec.definitions;
const fs = require('fs');

// called from shell
var result = [];
if(process.argv[1].match(/blah/g)) {
	Object.keys(paths).forEach((route) => {
		//console.log(route);
		run(route);
	});
	//console.log(JSON.stringify(result, null, '\t'));
	fs.writeFileSync('./result.json', JSON.stringify(result, null, '\t'));
}

// run
function run(route) {
	let objects = schemas.run(paths[route]);
	objects.forEach((item) => {
		result.push({
			name: item.schema,
			type: item.type,
			action: item.action,
			route: route
		});
	});
}
