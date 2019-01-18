#!/usr/bin/env node
let args = process.argv;
const fs = require('fs');
const cmdSpec = require('./nsx-full-spec.json');

// cli switch
var item = args[2];
var method = args[3];
compile(cmdSpec);

function compile(spec) {
	//let key = 'authentication.{moo}.list';
	let key = 'authentication{moo.list';
	console.log('key: ' + key);
	let matches = key.match(/\{.+\}/);
	let regex = /a/g;
	//let matches = key.match(regex);
	if(matches.length) {
		value = matches[0];
		console.log('match: ' + value);
	}
}
