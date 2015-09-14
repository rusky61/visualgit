#!/usr/bin/env node

/**
 *
 * Module dependencies
 *
 * set environments:
 * DEBUG=* or DEBUG=visualapp:server
 * env=development
 * WS_PROXY_URL=http://yourproxy:yourProxyPortNo
 */

var app = require('../app');
var debug = require('debug')('visualapp:server');
var fs = require("fs");
var _ = require('lodash-node');
var WebSocket = require('faye-websocket');
var util = require('util');

var hitcounter = 0;
/**
 * Get port from environment and it store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');
var wsProxyUrl = process.env.WS_PROXY_URL;

var wsOptions = (typeof wsProxyUrl === "undefined") ? {ping: 50} : {proxy:{ origin:  wsProxyUrl},ping: 50};
debug('wsOptions: %j',wsOptions);
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
	var data = fs.readFileSync(__dirname +'/../data/'+store+'.json','utf8');
	return JSON.parse(data);
}

function Coin(coin){
	this.coin = coin;
	this.blocks = this.initializeData();
}

Coin.prototype.initializeData = function () {
	debug('Initializing data for %s',this.coin);
	var data = fs.readFileSync(__dirname +'/../data/'+this.coin+'.json','utf8');
	return JSON.parse(data);
}

function BTC(){
	Coin.call(this,'btc');
}
util.inherits(BTC, Coin);

BTC.prototype.addBlock = function (block){
	return 1;
}


/*Coin.prototype.init = function(){
	this.blocks = initializeData('btc');
}
*/
//var btc2 = new BTC('btc');

var btc = initializeData('btc');
var ltc = initializeData('ltc');
var doge = initializeData('doge');

var clients = [];
var blockCacheSize = 70;

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
	clients.push(socket);
	debug('new connection from %s & concurrent clients number :%d',socket.address.ip, clients.length);
	socket.on('data', function(msg){
		debug('message received: %j', msg);
		//TODO: validate msg format
		if (msg.subscribe){
			var height = msg.height || -1;
			if(msg.subscribe === 'btc'){
				var blocks = getBlocksData(btc, height);
				for(var i=0;i<blocks.length;i++){
					socket.write({op:'block',coin:'btc',data:blocks[i]});
				}
			} else if (msg.subscribe === 'ltc'){
				var blocks = getBlocksData(ltc, height);
				for(var i=0;i<blocks.length;i++){
					socket.write({op:'block',coin:'ltc',data:blocks[i]});
				}
			} else if (msg.subscribe === 'doge'){
				var blocks = getBlocksData(doge, height);
				for(var i=0;i<blocks.length;i++){
					socket.write({op:'block',coin:'doge',data:blocks[i]});
				}
			}
		}else{
			debug('Unrecognized message');
		}
	});
	
});



primus.on('end', function () {
	  debug('Connection closed (end)');
});

primus.on('disconnection', function (spark) {
	_.pull(clients,spark);
	debug('Connection from %j: closed (disconnection)',spark.address);
	
});



function checkCacheSize(arr){
	if (arr.length > blockCacheSize){
		debug('trimming cache to %d blocks',blockCacheSize);
		arr.length = blockCacheSize;
	}
}

function addBlock(coin,block){
	if (coin == 'doge'){
		doge.unshift(block);
		checkCacheSize(doge);
		debug('Doge cache updated, currently %d blocks',doge.length);
	}
	if (coin == 'btc'){
		btc.unshift(block);
		checkCacheSize(btc);
		debug('BTC cache updated, currently %d blocks',btc.length);
	}
	if (coin == 'ltc'){
		ltc.unshift(block);
		checkCacheSize(ltc);
		debug('LTC cache updated, currently %d blocks',ltc.length);
	}


	// notify clients about new block, for now we notify all clients even they are subscribe for different coins.
	// They can use this information to notify user about new block for the othe currency
	clients.forEach(function(socket) {
    	socket.write({op:'block',coin:coin,data:block});
	});
}

/* Primus client doesn't support proxy, so for now we are using websockets for comunication to blokchain providers */
var ws_btc = new WebSocket.Client('wss://bitcoin.toshi.io', [], wsOptions);

ws_btc.on('open', function(event) {
	ws_btc.send(JSON.stringify({'subscribe':'blocks'}));
  	debug('BTC subscribed for wss://bitcoin.toshi.io');
});

ws_btc.on('message', function(event) {
	debug('BTC provider msg: %s',event.data);
	var data = JSON.parse(event.data);
	addBlock('btc',data.data);
});

ws_btc.on('close', function(event) {
  debug('BTC close %d %s', event.code, event.reason);
  ws_btc = null;
});

ws_btc.on('error', function(event) {
  debug('BTC error %j', event);
});

var ws_doge = new WebSocket.Client('wss://ws.dogechain.info/inv', [], wsOptions);

ws_doge.on('open', function(event) {
	ws_doge.send(JSON.stringify({'op':'blocks_sub'}));
  	debug('Doge subscribed for wss://ws.dogechain.info/inv');
});

ws_doge.on('message', function(event) {
	debug('Doge provider msg: %s',event.data);
	var data = JSON.parse(event.data);
	if (data.op == 'block'){
		debug('Doge - new block received');
		addBlock('doge',data.x)
	}
});

ws_doge.on('close', function(event) {
  debug('Doge: close %d %s', event.code, event.reason);
  ws_doge = null;
});

ws_doge.on('error', function(event) {
  debug('Doge: error %j', event);
});

var ws_ltc = new WebSocket.Client('wss://litecoin.toshi.io', [], wsOptions);

ws_ltc.on('open', function(event) {
	ws_ltc.send(JSON.stringify({'subscribe': 'blocks'}));
  	debug('LTC subscribed for wss://litecoin.toshi.io');
});

ws_ltc.on('message', function(event) {
	debug('LTC provider msg: %s',event.data);
	var data = JSON.parse(event.data);
	addBlock('ltc',data.data);
});

ws_ltc.on('close', function(event) {
  debug('LTC: close %d %s', event.code, event.reason);
  ws_ltc = null;
});

ws_ltc.on('error', function(event) {
  debug('LTC: error %j', event);
});

// do app specific cleaning before exiting
process.on('exit', function () {
	//process.emit('cleanup');
	debug('Storing block cache to files');
	//TODO: should be refactor to comon function
	var btcFd = fs.openSync(__dirname +'/../data/btc.json', 'w');
	fs.writeSync(btcFd,JSON.stringify(btc),0,'utf-8');
	fs.closeSync(btcFd);
	var ltcFd = fs.openSync(__dirname +'/../data/ltc.json', 'w');
	fs.writeSync(ltcFd,JSON.stringify(ltc),0,'utf-8');
	fs.closeSync(ltcFd);
	var dogeFd = fs.openSync(__dirname +'/../data/doge.json', 'w');
	fs.writeSync(dogeFd,JSON.stringify(doge),0,'utf-8');
	fs.closeSync(dogeFd);
});

// catch ctrl+c event and exit normally
process.on('SIGINT', function () {
	debug('Ctrl-C...');
	process.exit(2);
});

//catch uncaught exceptions, trace, then exit normally
process.on('uncaughtException', function(e) {
	console.log('Uncaught Exception...');
	console.log(e.stack);
	process.exit(99);
});

// bitstamp connection
// pusher-node-client doesn't have a proxy support for now. I have requested this feature on github
// https://github.com/abhishiv/pusher-node-client/issues/12

/*var Pusher = require('pusher-node-client').PusherClient;

var bitstamp = new Pusher({
	key: 'de504dc5763aeef9ff52',
    appId: '',
    secret: '' 
});



bitstamp.on('connect', function(){
	debug('Bitstamp is conected');
	var trades_channel = bitstamp.subscribe('live_trades');
	trades_channel.on('success', function(data) {
		debug('Bitstamp msg: %j',data);
	});
	
	trades_channel.bind('trade', function(data) {
		debug('Bitstamp msg: %j',data);
	});
}); 

bitstamp.connect(); 
debug(bitstamp);*/