#!/usr/bin/env node	

var fs = require('fs');
var request = require("request");

// idea is to emit latest block. worked form www file but not from here. 
//var primus = new Primus (server, {transformer: 'websockets', parser: 'JSON'});
//var Emitter = require ('primus-emitter');
//primus.use('emitter', Emitter);


var test = request("https://bitcoin.toshi.io/api/v0/blocks/latest", function (error, response, body){
test = JSON.parse(body);


delete test.transaction_hashes;


function blockcheck(callback){
	var x;
	
	var last = [];
	fs.readFile('/home/pi/visual/visualapp/bin/latestblock.json', 'utf8', function (err ,data){		
			if(err)
			{
			console.log(err);
			}else{
			last = JSON.parse(data)
			
			//console.log(last.height);

			var s = last.index
			var x = last.height						
			return callback(x, s);

			}
	});	
}

function latest(x, s){

	if (x === test.height)
	{
	//console.log("new block not yet available")


	}
	else if(!error && response.statusCode == 200)
	{
	
	//increment index from last JSON object (s) variable
	
	s++;
	
	test.index = s;
	
	
	fs.writeFile('/home/pi/visual/visualapp/bin/latestblock.json', JSON.stringify(test, null, 4), function(err){
		if(err) throw err;
	});
	
	
	fs.readFile("/home/pi/visual/visualapp/bin/data.json", "utf8", function (err, data){
	if (err) throw err;
	var object = JSON.parse(data)
	
	//buggy should remove first block from JSON file. deactivated. not sure this is the way forward.
       
	
	object.push(test);
	 object.shift();
			
			fs.writeFile("/home/pi/visual/visualapp/bin/data.json", JSON.stringify(object, null, 4 ), function (err){
			if(err) throw err;
			//console.log("saved");
			
			});
	
	});
	
	}

}

blockcheck(latest);

});

			
function emitblock(){
	console.log('should emit now');
	
	primus.on('connection', function(spark){
	spark.send('newblock') 
	fs.createReadStream(__dirname + '/latestblock.json', {encoding:'utf8'}).pipe(spark, { end: false
		});
	});
}



	



//var remove = JSON.parse(fs.readFileSync("/home/pi/visual/visualapp/bin/data.json", "utf8"))
//remove.shift();
//fs.writeFile('/home/pi/visual/visualapp/bin/data.json', JSON.stringify(remove, null, 4));
//Random Code:
//var obj = JSON.parse();
//console.log(test.height, test.confirmations, test.merkle_root, test.time, test.difficulty);
//var obj = JSON.parse(fs.readFileSync('data.json', 'utf8'));
//.pipe(fs.createWriteStream("./data.json, {flags: 'a'}"));
//var JSONstream = require ('JSONStream');:










