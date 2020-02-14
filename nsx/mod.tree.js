#!/usr/bin/env node
const args = process.argv;
const core = require('./mod.core');

// constructor
module.exports = {
	run
};
var cache = {};

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;
const cyan = chalk.cyan;

// define shapes
const t = '\u251c';
const h = '\u2500';
const v = '\u2502';
const e = '\u2514';
const s = ' ';
const width = 2;
const shapes = {
	t: '\u251c',
	h: '\u2500',
	v: '\u2502',
	e: '\u2514',
	s: ' '
};
const level = {
	t: shapes.v + shapes.s.repeat(width) + ' ',
	b: shapes.t + shapes.h.repeat(width) + ' ',
	l: shapes.e + shapes.h.repeat(width) + ' ',
	s: shapes.s + shapes.s.repeat(width) + ' '
};

// entry
function run(opts = {}) {
	let defaults = Object.assign({
		tree: './state/ctx.tree',
		body: core.loadJSON('./state/ctx.tree'),
		depth: 20
	}, core.cleanObject(opts));
	tree(defaults.body, [], defaults.depth, 0);
}

function tree(body, array, depth, index = 0) {
	let bodyArray = Object.entries(body);
	let token = 1;
	array.push('b'); // branch
	index++;
	bodyArray.forEach((item) => {
		if(token++ >= bodyArray.length) {
			array[(array.length - 1)] = 'l'; // leaf
		}
		if(typeof(item[1]) === 'object') {
			if(index <= depth) {
				console.log(getString(item[0], array));
				let newarr = array.slice();
				if(newarr[newarr.length - 1] == 'l') { // leaf
					newarr[(newarr.length - 1)] = 's'; // space
				} else {
					newarr[(newarr.length - 1)] = 't'; // trunk
				}
				tree(item[1], newarr, depth, index);
			} else {
				console.log(getString(item[0], array, '+'));
			}
		} else { // leaf
			console.log(getString(item[0], array));
		}
	});
}

function getString(label, array, plus) {
	if(typeof(plus) === 'undefined') {
		plus = '';
	}
	let string = '';
	for(let i = 0; i < array.length; i++) {
		string += level[array[i]];
	}
	string += cyan(label) + orange(plus); // colour
	return string;
}
