#!/usr/bin/env node
const fs = require('fs');

// constructor
module.exports = {
	scope,
	def,
	loadJSON,
	cleanObject
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

function cleanObject(obj) {
	return Object.entries(obj).reduce((a, [k, v]) => {
		if(v == null || (typeof(v) == 'number' && Number.isNaN(v))) { // strip null, undefined, and NaN values
			return a;
		} else {
			return {...a, [k]:v};
		}
	}, {});
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
