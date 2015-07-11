#!/usr/bin/env node

var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));

console.log(obj.hash);
