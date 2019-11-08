#!/usr/bin/env node
const fs = require('fs');

// constructor
module.exports = {
	scope,
	def,
	loadJSON
};

function scope() {
	return loadJSON('./state/ctx.scope');
}

function def(item) {
        if(typeof(item) !== 'undefined') {
                return item;
        } else {
                return 0;
        }
}

function isObject(obj) {
	if(obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]') {
		return true;
	} else {
		return false;
	}
}

function loadJSON(file) {
	if(fs.existsSync(file)) {
		return JSON.parse(fs.readFileSync(file));
	} else {
		return {};
	}
}
