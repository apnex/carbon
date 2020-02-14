#!/usr/bin/env node
const args = process.argv;
const tree = require('./mod.tree');
const core = require('./mod.core');
const schema = require('./mod.object.tree');
const fs = require('fs');

// args
var entity = args[2];
var depth = Number(args[3]);

// called from shell
if(process.argv[1].match(/tree/g)) {
	var result = schema.run(entity, {
		spec: './apispec.json',
		depth: -1
	});
	if(core.def(result)) {
		fs.writeFileSync('./tree.json', JSON.stringify(result, null, '\t'));
		tree.run({
			tree: './tree.json',
			depth
		});
	} else {
		console.log('-- [ / ] --');
		filter(args[2]).forEach((value) => {
			console.log(value);
		});
	}
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

	}
}

const schema = core.loadJSON(scope.spec).definitions;

// called from shell
if(process.argv[1].match(/object.list/g)) {
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
