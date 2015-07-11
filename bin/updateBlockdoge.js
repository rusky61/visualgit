#!/usr/bin/env node	

var fs = require('fs');
var request = require("request");

cleanBlock(getlast);

function cleanBlock(callback){

var block = request('http://api.blockstrap.com/v0/doge/block/latest', function (error, response, body){
var x = [];
 
block = JSON.parse(body);
delete block.data.block_request
delete block.data.status;
delete block.data.block._request;
delete block.data.block.transactions;

//console.log(block.data.block);
x = block.data.block; 
callback(x);
 
	});

}


function getlast(x){
	var object;
	fs.readFile("/home/pi/visual/visualapp/bin/data2.json", "utf8", function (err, data){
	if (err) throw err;
	
	object = JSON.parse(data);

	//fetch last object from array.	
	var last = object[object.length-1];
//	console.log(last.height);
	if( last.height === x.height){
//	console.log('block remains the same.')
	}else{ 
	
	object.push(x);
//shift() removes first object in array. limits blocks that are displayed
	object.shift();	
	writeData(object)
//	console.log('new block ' + x.height)
	}
});

}
/*
function getData(x){
	var object;
	fs.readFile("/home/pi/visual/visualapp/bin/data2.json", "utf8", function (err, data){
	if (err) throw err;
	
	object = JSON.parse(data);
	
	
	object.push(x);
	writeData(object)
})

*/

function writeData(object){

fs.writeFile('/home/pi/visual/visualapp/bin/data2.json', JSON.stringify(object, null, 4), function(err){
		if(err) throw err;
	});	
}			

