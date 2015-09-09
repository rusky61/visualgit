#!/usr/bin/env node

/**
 *
 * Module dependencies
 *
 * set environments:
 * DEBUG=*
 * env=development
 */

var app = require('../app');
var debug = require('debug')('visualapp:server');
var fs = require("fs");
var _ = require('lodash-node');
var hitcounter = 0;
/**
 * Get port from environment and it store in Express.
 */
var clients = 0;
var port = normalizePort(process.env.PORT || '3000');
//app.set('port', port);

/**
 * Create HTTP server
 */

var Primus = require('primus');
var http = require('http');

var server = http.createServer(app);

var primus = new Primus(server, {transformer : 'websockets', parser : 'JSON'});
//var Emitter = require ('primus-emitter');
//primus.use('emitter', Emitter); 

function initializeData(store) {
	debug('Initializing data for %s',store);
	var data = fs.readFileSync(__dirname +'/'+store+'.json','utf8');
	return JSON.parse(data);
}
var btc = initializeData('btc');
var ltc = initializeData('ltc');
var doge = initializeData('doge');

server.listen(port);
debug('Server binded on %j',server.address());

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

function getBlocksData(coin, height){
	var index = _.findIndex(coin, function(el) {
			return el.height == parseInt(height);
	});
	var part = coin;
	if (index > -1){
		part = _.slice(coin, ++index);
	}
	return part;
}

primus.on('connection', function(socket)  {
	clients++;	
	debug('new connection from %s & concurrent clients number :%d',socket.address.ip, clients);
	socket.on('data', function(msg){
		debug('messgae received: %j', msg);
		//TODO: validate msg format
		if(msg.coin ==='bitcoin'){
			socket.write(getBlocksData(btc,msg.height));
		} else if (msg.coin === 'litecoin'){
			//debug('%j',getBlocksData(ltc,msg.height));
			socket.write(getBlocksData(ltc,msg.height));
		} else if (msg.coin === 'dogecoin'){
			socket.write(getBlocksData(doge,msg.height));
		}
	});
	
});



primus.on('end', function () {
	  debug('Connection closed (end)');
});

primus.on('disconnection', function (spark) {
	// the spark that disconnect
	debug('Connection from %j: closed (disconnection)',spark.address);
	clients--;
});
