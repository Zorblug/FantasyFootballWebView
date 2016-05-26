'use strict'
console.log('Server - WEB RDVB TEST');

var port = 80;
var http = require('http');
var express = require('express');

var pub = express();
var httpServer = http.createServer(pub);

pub.use(express.static('public'));

console.log('READY LISTEN :' + port);
httpServer.listen(port);
