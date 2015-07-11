#!/usr/bin/env node	

var fs = require('fs');
var request = require("request");

// idea is to emit latest block. worked form www file but not from here. 
//var primus = new Primus (server, {transformer: 'websockets', parser: 'JSON'});
//var Emitter = require ('primus-emitter');
//primus.use('emitter', Emitter);



var test = request("https://litecoin.toshi.io/api/v0/blocks", function (error, response, body){
test = JSON.parse(body);
test.reverse();
for (i=0; i<test.length;i++){
	delete test[i].transaction_hashes;

}

fs.writeFile('/home/pi/visual/visualapp/bin/data1.json', JSON.stringify(test, null, 4), function(err){
		if(err) throw err;
	});

});












