#!/usr/bin/env node
let args = process.argv;
let nsxapi = require('./nsx-api.json');

// base definition
//var item = "logical-routers";
var item = args[2];
var method = args[3];
var paths = nsxapi.definitions;

function search() {
	let path = paths[item]
	if(path) {
		//console.log(JSON.stringify(path, null, "\t"));
		resolve(item);
	}
}

var itemKeys = [];
function resolve(item) {
	// if allOf
	// loop
	curItem = paths[item];
	if(typeof curItem.allOf !== 'undefined') {
		console.log('Contains an ALLOF');
		// if key == $ref
		curItem.allOf.forEach((item) => {
			if(item["$ref"]) {
				console.log('has a ref');
				console.log(JSON.stringify(item, null, "\t"));
			} else {
				console.log(JSON.stringify(item, null, "\t"));
				for(let key of Object.keys(item.properties)) {
					console.log('key [' + key + ']');
				}
			}
		});
	}
	//let fullspec = routes[def].allOf[1].properties;
	//let minspec = routes[def].allOf[1].required;
	//console.log(fullspec);
}

if(item) {
	//console.log(item);
	search();
} else {
	for(let key of Object.keys(paths)) {
		console.log('key [' + key + ']');
	}
}

//console.log(JSON.stringify($paths, null, "\t"));
