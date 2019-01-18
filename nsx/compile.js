#!/usr/bin/env node
let args = process.argv;
const hd = require('heredoc');
const fs = require('fs');
const cmdSpec = require('./nsx-full-spec.json');

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
		if(key == 'get') {
			let drvFile = 'drv.' + newKeys.join('.');
			if(!fs.existsSync(drvFile)) {
				writeDriver(drvFile);
			}
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
		FILEPATH=$0
		if [[ -L ${FILEPATH} ]]; then
			FILEPATH=$(readlink $0)
		fi
		if [[ $FILEPATH =~ ^(.*)/([^/]+)$ ]]; then
			WORKDIR="${BASH_REMATCH[1]}"
			CALLED="${BASH_REMATCH[2]}"
		fi
		source ${WORKDIR}/cmd
		run() {
			## input driver
			local ITEM
			if [[ $CALLED =~ cmd[.](.+)$ ]]; then
				ITEM=$(printf "${BASH_REMATCH[1]}")
			fi
			local INPUT=$(${WORKDIR}/drv.${ITEM})
			printf "${INPUT}" | jq --tab .
		}
		IFS=$'\n'
		INPUTS=($(chain "${@}"))
		case "${INPUTS[0]}" in
			run) # run
				run
			;;
			*) # tab
				printf "%s\n" "${INPUTS[@]}" | uniq
			;;
		esac
	*/})
	fs.writeFileSync('./lib/' + fileName, body);
}

function writeDriver(fileName) {
        let body = hd.strip(function() {/*
		#!/bin/bash
		FILEPATH=$0
		if [[ -L ${FILEPATH} ]]; then
			FILEPATH=$(readlink $0)
		fi
		if [[ $FILEPATH =~ ^(.*)/([^/]+)$ ]]; then
			WORKDIR="${BASH_REMATCH[1]}"
			CALLED="${BASH_REMATCH[2]}"
		fi
		source ${WORKDIR}/drv.core
		source ${WORKDIR}/drv.nsx.client
		if [[ $CALLED =~ drv[.](.+)[.][^.]+$ ]]; then
			ITEM=$(printf "${BASH_REMATCH[1]}" | tr '.' '/')
		fi
		if [[ -n "${NSXHOST}" ]]; then
			URL=$(buildURL "${ITEM}")
			if [[ -n "${URL}" ]]; then
				printf "[$(cgreen "INFO")]: nsx [$(cgreen "get")] ${ITEM} [$(cgreen "$URL")]... " 1>&2
				nsxGet "${URL}"
			fi
		fi
        */})
	fs.writeFileSync('./lib/' + fileName, body);
}
