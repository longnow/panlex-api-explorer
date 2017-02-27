#!/usr/bin/env node

var chokidar = require('chokidar');
var spawn = require('child_process').spawn;

make();

chokidar.watch(['bootstrap','js','style.styl','templates'])
.on('change', make)
.on('error', function (err) { console.log(err) });

function make() {
  console.log(new Date() + ': make');

  var error = false;

  var proc = spawn('npm', ['run','make'], { stdio: ['ignore','ignore','pipe'] });

  proc.stderr.on('data', function (chunk) {
    process.stderr.write(chunk, 'utf8');
    error = true;
  });

  proc.on('close', function (code) {
    if (error) console.log('');
  });
}
