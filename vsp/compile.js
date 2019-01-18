#!/usr/bin/env node
let args = process.argv;
const hd = require('heredoc');
const fs = require('fs');
//const cmdSpec = require('./nsx-full-spec.json');
const cmdSpec = require('./vsp-full-spec.json');

// cli switch
var item = args[2];
var method = args[3];
compile(cmdSpec);

function compile(spec) {
	// loop through keys
	// construct file.name array
	// recurse
	//console.log(JSON.stringify(spec, null, "\t"));
	myTree([], spec);
}

function myTree(keys, cmds) {
	Object.keys(cmds).forEach((key) => {
		let body = cmds[key];
		if(matches = key.match(/\{(.+)\}/)) {
			key = matches[1] + '[]';
		}
		let newKeys = keys.slice(0);
		newKeys.push(key);
		let thisFile = 'cmd.' + newKeys.join('.');
		if(!fs.existsSync(thisFile)) {
			writeFile(thisFile);
		}
		if(Object.keys(body).length) {
			myTree(newKeys, body);
		} else {
			console.log('LEAF: ' + newKeys.join('.'));
		}
	});
}

function writeFile(fileName) {
	let body = hd.strip(function() {/*
		#!/bin/bash
		# detect and resolve symlink
		if [[ -L $0 ]]; then
			if [[ $(readlink $0) =~ ^(.*)/([^/]+)$ ]]; then
				WORKDIR="${BASH_REMATCH[1]}"
				CALLED="${BASH_REMATCH[2]}"
			fi
		else
			if [[ $0 =~ ^(.*)/([^/]+)$ ]]; then
				WORKDIR="${BASH_REMATCH[1]}"
				CALLED="${BASH_REMATCH[2]}"
			fi
		fi
		source ${WORKDIR}/cmd
		chain "${@}"
	*/})
	fs.writeFileSync(fileName, body);
}
