#!/usr/bin/env node
const args = process.argv;
const core = require('./mod.core');
const fs = require('fs');
const scope = core.scope();
const definitions = core.loadJSON(scope.spec).definitions;

// called from shell
if(process.argv[1].match(/object.complete/g)) {
	writeComplete()
}

// filter
function writeComplete(value) {
	let data = {};
	Object.keys(definitions).sort().forEach((value) => {
		data[value] = 1;
	});
	fs.writeFileSync('./state/ctx.object.complete', JSON.stringify(data, null, '\t'));
	console.log(JSON.stringify(data, null, '\t'));
}
