#!/usr/bin/env node

var chokidar = require('chokidar');
var spawn = require('child_process').spawn;

make();

chokidar.watch(['bootstrap','js','style.styl','templates'])
.on('change', make)
.on('error', function (err) { console.log(err) });

function make() {
  spawn('npm', ['run','make'], { stdio: 'inherit' });
}
