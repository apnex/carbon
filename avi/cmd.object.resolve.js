#!/usr/bin/env node
const args = process.argv;
const schema = require('./mod.object.resolve');
const core = require('./mod.core');
const scope = core.scope();

// args
var item = scope.object;
var method = args[2];
var depth = Number(args[3]);

// called from shell
if(process.argv[1].match(/object.resolve/g)) {
	switch(method) {
		case "raw":
			var result = schema.run(item, {
				raw: 1
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "read":
			var result = schema.run(item, {
				depth
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "readHidden":
			var result = schema.run(item, {
				hidden: 1,
				deprecated: 1,
				depth
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "write":
			var result = schema.run(item, {
				writeOnly: 1,
				depth
			});
			console.log(JSON.stringify(result, null, "\t"));
		break;
		case "writeMin":
			var result = schema.run(item, {
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

