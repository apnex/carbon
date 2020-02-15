#!/usr/bin/env node
const args = process.argv;
const schema = require('./mod.object.resolve');
const core = require('./mod.core');

// args
var entity = args[2];
var method = args[3];
var depth = Number(args[4]);

// called from shell
if(args[1].match(/object.resolve/g)) {
	switch(method) {
		case "raw":
			var result = schema.run(entity, {
				raw: 1
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "read":
			var result = schema.run(entity, {
				depth
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "readHidden":
			var result = schema.run(entity, {
				hidden: 1,
				deprecated: 1,
				depth
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "write":
			var result = schema.run(entity, {
				writeOnly: 1,
				depth
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "writeMin":
			var result = schema.run(entity, {
				writeOnly: 1,
				required: 1,
				depth
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		default:
			console.log('Specify one action - read, readHidden, write, writeMin, raw');
		break;
	}
}

