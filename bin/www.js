#!/usr/bin/env node

/**
 *
 * Module dependencies
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
app.set('port', port);

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
	console.log('Initializing data for '+store);
	var data = fs.readFileSync(__dirname +'/'+store+'.json','utf8');
	return JSON.parse(data);
}
var btc = initializeData('btc');
var ltc = initializeData('ltc');
var doge = initializeData('doge');

server.listen(3000);


/*
function handler(req, res) {
    fs.readFile('../data.json', function (err, data) {
        if (err) {
            console.log(err);
            res.writeHead(500);
            return res.end('Error loading web page');
        }
        res.writeHead(200);
        res.end(data);
    });
}
*/

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

/*
primus.on('connection', function(spark) {

	spark.send('hello', { hello: 'james' });
	

});
*/

primus.on('connection', function(socket)  {
	clients++;	
	console.log('new connection from '+socket.address.ip+' & concurrent clients number :'+clients);
	socket.on('data', function(msg){
		console.log('messgae received  ', msg);
		if(msg.coin =='bitcoin'){
	        /*var data = fs.readFileSync(__dirname +'/data.json','utf8');
			obj = JSON.parse(data);*/
			var index = _.findIndex(btc, function(el) {
  				return el.height == msg.height;
			});
			var part = btc;
			if (index > -1){
				part = _.slice(btc, ++index);
			}
			socket.write(part);
		} else if (msg == 'litecoin'){
	        /*var data = fs.readFileSync(__dirname +'/data1.json','utf8');
			obj = JSON.parse(data);*/
			socket.write(ltc);
		} else if (msg == 'dogecoin'){
			/*var data = fs.readFileSync(__dirname +'/data2.json','utf8');
			obj = JSON.parse(data);*/
			socket.write(doge);
		}
	});
	
});



primus.on('end', function () {
	  console.log('Connection closed');
});

primus.on('disconnection', function (spark) {
	// the spark that disconnect
	console.log('Connection closed',spark.address);
	clients--;
});
