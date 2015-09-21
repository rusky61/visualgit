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

var BLOCK_CACHE_SIZE = 70;
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

//disable console.log
//console.log = function(){};

function Coin(coin){
	this.coin = coin;
	this.blocks = this.initializeData();
	this.priceChanged = false;
}

/*Loads block cache from file*/
Coin.prototype.initializeData = function () {
	debug('Initializing data for %s',this.coin);
	var data = fs.readFileSync(__dirname +'/../data/'+this.coin+'.json','utf8');
	return JSON.parse(data);
}

/*prints block cache*/
Coin.prototype.printBlocks = function () {
	debug('blocks for %s %j',this.coin, this.blocks);
}

/*Adds block to cache and trim the cache if needed*/
Coin.prototype.addBlock = function(block){
	this.blocks.unshift(block);
	this.checkCacheSize();
	debug('%s cache updated, currently %d blocks',this.coin,this.blocks.length);
}

/*Nomralize and add block to cache*/
Coin.prototype.normalizeAndAddBlock = function (block){
	//debug('normalize %s %j',this.coin,this.acceptBlockKeys);
	var keys = _.intersection(Object.keys(block),this.acceptBlockKeys);
	var r = {};
	_.forEach(keys,function(key){
		r[key]=block[key];
	});
	this.addBlock(r);
	return r;
}

/*Gets last blocks from cache*/
Coin.prototype.getBlocksData = function(height){
	var index = -1;
	if (height != -1){
		index = _.findIndex(this.blocks, function(el) {
				return el.height == parseInt(height);
		});
	}
	
	var part = [];
	if (index === -1){
		part = this.blocks;
	}else if (index > 0){
		//debug('getblocks slice index %d height %d',index, height);
		part = _.slice(this.blocks,0, index);
	}
	return part;
}

/*Trims cache if needed*/
Coin.prototype.checkCacheSize = function(){
	if (this.blocks.length > BLOCK_CACHE_SIZE){
		debug('trimming cache to %d blocks',BLOCK_CACHE_SIZE);
		this.blocks.length = BLOCK_CACHE_SIZE;
	}
}

/*Serialize block cache to file*/
Coin.prototype.storeCachedBlocksToFile = function(){
	debug('Storing block cache for %s',this.coin);
	var fd = fs.openSync(__dirname +'/../data/'+this.coin+'.json', 'w');
	fs.writeSync(fd,JSON.stringify(this.blocks),0,'utf-8');
	fs.closeSync(fd);
}

function BTC(){
	this.acceptBlockKeys = ['hash', 'branch', 'previous_block_hash', 'height','confirmations','merkle_root','time','created_at','nonce',
		'bits','difficulty','reward','fees','total_out','size','transactions_count','version','index'];
	Coin.call(this,'btc');
}
util.inherits(BTC, Coin);


function LTC(){
	this.acceptBlockKeys = ['hash', 'branch', 'previous_block_hash', 'height','confirmations','merkle_root','time','created_at','nonce',
		'bits','difficulty','reward','fees','total_out','size','transactions_count','version'];
	Coin.call(this,'ltc');
}
util.inherits(LTC, Coin);

function DOGE(){
	this.acceptBlockKeys = ['nonce', 'merkleroot', 'hash', 'height','difficulty','n_tx','size','miner','version','time','reward','bits'];
	Coin.call(this,'doge');
}
util.inherits(DOGE, Coin);

/*Coin.prototype.init = function(){
	this.blocks = initializeData('btc');
}
*/
var coins = { 
	'btc':new BTC(),
	'ltc':new LTC(),
	'doge':new DOGE()
}

function initializePriceData() {
	debug('Initializing price data ...');
	var data = fs.readFileSync(__dirname +'/../data/prices.json','utf8');
	var prices = JSON.parse(data);
	_.forEach(prices,function(coinPrice,key){
		coins[key].lastPrice = coinPrice;
	});
}

function storePricesToFile(){
	debug('Storing prices to file');
	var prices = {};
	_.forEach(coins,function(coin,key){
		prices[key] = coin.lastPrice;
	});
	var fd = fs.openSync(__dirname +'/../data/prices.json', 'w');
	fs.writeSync(fd,JSON.stringify(prices),0,'utf-8');
	fs.closeSync(fd);
}

initializePriceData();

/*All clients connections are stored in this array*/
var clients = [];

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

var userNr = 1;

function getChatUsers(){
	var chatNames = [];
	_.forEach(clients, function(client){
		chatNames.push(client.chatUserName);
	});
	return chatNames;
}

primus.on('connection', function(socket)  {
	clients.push(socket);
	socket.chatUserName = 'user_' + userNr++;
	debug('new connection from %s & concurrent clients number :%d',socket.address.ip, clients.length);
	socket.on('data', function(msg){
		debug('message received: %j', msg);
		//TODO: validate msg format
		if (msg.subscribe){
			var height = msg.height || -1;
			if (!_.isUndefined(coins[msg.subscribe])){
				var blocks = coins[msg.subscribe].getBlocksData(height);
				_.forEachRight(blocks, function(block){
					socket.write({op:'block',coin:msg.subscribe,data:block});
				});

				/*Update customer with priceses only when he connects*/
				if (height === -1){
					updateClientWithPrices(socket);
				}
			}else{
				debug('Client: Unrecognized coin symbol in subscribe');	
			}
		}else if (msg.op == "chat"){
			var changeChatName = /^!(\w+)\s+(\w+)/;
			var skipEcho = false;
			if (typeof msg.text === 'string' ){
				var r = msg.text.match(changeChatName);
				//debug("compare command %j",r);
				if (r != null && r[1] === "nick"){
					var newNick = (r[2].length > 10) ? r[2].substring(0, 10) : r[2];
					debug("changing chat name to %s", newNick);
					notifyChatClientsAboutNickChange(socket.chatUserName,newNick);
					socket.chatUserName = newNick;
					skipEcho = true;
				}
			}
			if (!skipEcho) notifyClientsChat(socket.chatUserName+':'+msg.text);
		}
		else{
			debug('Client: Unrecognized message');
		}
	});
	//sent current chat usernames
	socket.write({op:'chatUsers',data:getChatUsers()});
	notifyChatClientsAboutNewUser(socket);
});


primus.on('end', function () {
	  debug('Connection closed (end)');
});

primus.on('disconnection', function (spark) {
	_.pull(clients,spark);
	debug('Connection from %j: closed (disconnection)',spark.address);
	notifyClientsChat('!sys:'+ spark.chatUserName + ' disconnected');
});

function notifyChatClientsAboutNewUser(without){
	clients.forEach(function(socket) {
		if (socket != without){
    		socket.write({op:'chatUsers',data:[without.chatUserName]});
    	}
	});
}

function notifyChatClientsAboutNickChange(from,to){
	clients.forEach(function(socket) {
    	socket.write({op:'chatNickChange',from:from,to:to});
	});
}

function notifyClientsChat(text){
	clients.forEach(function(socket) {
    	socket.write({op:'chat',text:text});
	});
}

/*Notifies clients about new block, for now we notify all clients even they are subscribe for different coins.
Clients can use this information to notify user about new block for the other currency*/
function notifyClients(coin,block){
	clients.forEach(function(socket) {
    	socket.write({op:'block',coin:coin,data:block,fresh:1});
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
	var nBlock = coins['btc'].normalizeAndAddBlock(data.data);
	notifyClients('btc',nBlock);
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
		var nBlock = coins['doge'].normalizeAndAddBlock(data.x);
		//debug('Doge normalized: %j',nBlock);
		notifyClients('doge',nBlock);
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
	var nBlock = coins['ltc'].normalizeAndAddBlock(data.data);
	notifyClients('ltc',nBlock);
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
	debug('Storing block cache to files');
	_.forEach(coins,function(coin,key){
		coin.storeCachedBlocksToFile();
	});
	storePricesToFile();
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
	debug('Uncaught Exception...');
	debug(e.stack);
	process.exit(99);
});

// bitstamp connection for BTC/USD market
// pusher-node-client doesn't have a proxy support for now. I have requested this feature on github
// https://github.com/abhishiv/pusher-node-client/issues/12

var Pusher = require('./pusher-node-client-proxy').PusherClient;


var bitstamp = new Pusher({
	key: 'de504dc5763aeef9ff52',
    appId: '',
    secret: '',
    proxy: wsOptions
});


bitstamp.on('connect', function(){
	debug('Bitstamp is conected');
	var trades_channel = bitstamp.subscribe('live_trades');
	trades_channel.on('success', function(data) {
		debug('Bitstamp msg: %j',data);
	});
	
	trades_channel.on('trade', function(data) {
		debug('Bitstamp trade msg: %j',data);
		if (coins['btc'].lastPrice != data.price){
			coins['btc'].lastPrice = data.price;
			coins['btc'].priceChanged = true;
			debug('BTC price change to:',data.price);
		}

	});
}); 

bitstamp.connect(); 

/*Sends all current prices to one client*/
function updateClientWithPrices(socket){
	var msg = {op:'price'};
	var prices = {};
	_.forEach(coins, function (coin,key){
		if (coin.lastPrice){
			debug('found price to be sent %d, %s',coin.lastPrice,key);
			prices[key] = coin.lastPrice;
		}
	});
	//debug('p l %d',prices.length);
	if (Object.keys(prices).length > 0){
		msg.prices = prices;
		socket.write(msg);
	}
}


/*Sends prices updates to all clients with max 5s delay.*/
function updateAllClientsWithCoinPrice(){
	//debug('check price update');

	if (coins['btc'].priceChanged){
		coins['btc'].priceChanged = false;
	    clients.forEach(function(socket) {
	    	socket.write({op:'price',prices:{'btc':coins['btc'].lastPrice}});
		});
		debug('sent new price update to all clients');
	}
}

//updateClientsWithCoinPrice();
setInterval(function(){
	updateAllClientsWithCoinPrice();
}, 5000);


/*
cyptsy: https://www.cryptsy.com/pages/pushapi
markets:
	LTC/USD 1
	DOGE/USD 182
*/
var cryptsy = new Pusher({
	key: 'cb65d0a7a72cd94adf1f',
    appId: '',
    secret: '',
    proxy: wsOptions
});


cryptsy.on('connect', function(){
	debug('cryptsy is conected');
	var ltc_usd = cryptsy.subscribe('trade.1');
	ltc_usd.on('success', function(data) {
		debug('cryptsy ltc/usd msg: %j',data);
	});

	ltc_usd.on('trade', function(data) {
		debug('cryptsy ltc/usd trade msg: %j',data);
	});

	var doge_usd = cryptsy.subscribe('trade.182');
	doge_usd.on('success', function(data) {
		debug('cryptsy doge/usd msg: %j',data);
	});

	doge_usd.on('trade', function(data) {
		debug('cryptsy doge/usd trade msg: %j',data);
	});

	
	/*trades_channel.on('trade', function(data) {
		debug('cryptsy trade msg: %j',data);
		if (coins['btc'].lastPrice != data.price){
			coins['btc'].lastPrice = data.price;
			coins['btc'].priceChanged = true;
			debug('BTC price change to:',data.price);
		}

	});*/
}); 

cryptsy.connect(); 