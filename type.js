#!/usr/bin/env node
let args = process.argv;
let nsxapi = require('./nsx-api.json');

// base definition
var route = "logical-routers";
var route = args[2];
var method = args[3];
var paths = nsxapi.paths;

function spec(def) {
	let fullspec = nsxapi.definitions[def].allOf[1].properties;
	let minspec = nsxapi.definitions[def].allOf[1].required;
	console.log(fullspec);
}

function search() {
	let path = nsxapi.paths['/' + route]
	if(path) {
		//console.log(JSON.stringify($path, null, "\t"));
		var schema = "";;
		if(method) { // output specific spec as switch
			if(method == "get") {
				let call = path["get"];
				let params = call.responses["200"];
				console.log("GET");
				if(call.parameters) {
					console.log(JSON.stringify(call.parameters, null, "\t"));
				}
			}
			if(method == "put") {
				let call = path["get"];
				let params = call.responses["200"];
				console.log("PUT");
				if(call.parameters) {
					console.log(JSON.stringify(call.parameters, null, "\t"));
				}
			}
			if(method == "post") {
				let call = path["post"];
				let params = call.responses["201"];
				console.log("POST");
				if(call.parameters) {
					console.log(JSON.stringify(call.parameters, null, "\t"));
				}
			}
			if(method == "delete") {
				let call = path["delete"];
				let params = call.responses["201"];
				console.log("DELETE");
				if(call.parameters) {
					console.log(JSON.stringify(call.parameters, null, "\t"));
				}
			}
		} else {
			console.log(JSON.stringify(path, null, "\t"));
			console.log("No method specified");
		}
		if(path.parameters) {
			console.log(JSON.stringify(path.parameters, null, "\t"));
		}
		/*
		if(schema) {
			console.log("Schema [" + schema + "]");
			let regex = /#\/definitions\/([a-z0-9A-Z]+)$/g;
			let match = regex.exec(schema);
			let defKey = match[1];
			console.log("Definition [" + defKey + "]");
			spec(defKey);
		}
		*/
	}
}

if(route) {
	search();
} else {
	Object.keys(paths).sort().forEach((item) => {
		console.log('key [' + item + ']');
	});
}

//console.log(JSON.stringify($paths, null, "\t"));
