#!/usr/bin/env node

var chokidar = require('chokidar');
var spawn = require('child_process').spawn;

chokidar.watch(['bootstrap','js','style.styl', 'templates'])
.on('change', function (f) {
  spawn('npm', ['run','make'], { stdio: 'inherit' });
})
.on('error', function (err) {
  console.log(err);
});
