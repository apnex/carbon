#!/usr/bin/env node

const URLSearchParams = require('url').URLSearchParams;
const searchParams = new URLSearchParams([['key', 'a'], ['key', 'b']]);

console.log(searchParams.toString());
