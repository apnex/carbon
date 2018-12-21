#!/usr/bin/env node
let args = process.argv;
let apiSpec = require('./nsx-api.json');

// base definition
//var item = "logical-routers";
var item = args[2];
var method = args[3];
var paths = apiSpec.definitions;

function spec(def) {
	let fullspec = apiSpec.definitions[def].allOf[1].properties;
	let minspec = apiSpec.definitions[def].allOf[1].required;
	console.log(fullspec);
}

function search() {
	let path = paths[item]
	if(path) {
		console.log(JSON.stringify(path, null, "\t"));
		var schema = "";;
		if(method) { // output specific spec as switch
			if(method == "get") {
				let params = $path["get"].responses["200"];
				schema = params.schema["$ref"];
				console.log("GET");
			}
			if(method == "put") {
				let params = path["put"].responses["200"];
				schema = params.schema["$ref"];
				console.log("PUT");
			}
			if($method == "post") {
				let params = path["post"].responses["201"];
				schema = params.schema["$ref"];
				console.log("POST");
			}
			if($method == "delete") {
				let params = path["delete"].parameters;
				schema = params[0].schema["$ref"];
				console.log("DELETE");
			}
		//} else {
			//console.log(JSON.stringify(path, null, "\t"));
			//console.log("No method specified");
		}
		if(schema) {
			console.log("Schema [" + schema + "]");
			let regex = /#\/definitions\/([a-z0-9A-Z]+)$/g;
			let match = regex.exec(schema);
			//console.log(JSON.stringify($match, null, "\t"));
			let defKey = match[1];
			console.log("Definition [" + defKey + "]");
			spec(defKey);
		}
	}
}

if(item) {
	//console.log(item);
	search();
} else {
	Object.keys(paths).sort().forEach((item) => {
		console.log('key [' + item + ']');
	});
}

//console.log(JSON.stringify($paths, null, "\t"));
