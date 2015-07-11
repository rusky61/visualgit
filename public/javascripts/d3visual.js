
var coin = 1;

var data = {
	           "nodes":[
		   ],
		   "links":[
		   ]
    };


var elmnt = document.getElementById("area2");
        
//var h = window.innerHeight;
//var w = elmnt.offsetWidth;
var radius = 6;
  
var coinSize = 40;
var t0 = Date.now();

// Define the div for the tooltip
 var div = d3.select("#area2").append("div")   
.attr("class", "tooltip")               
  // .style("opacity", 0);

show();

//D3 force layout setup
var force = d3.layout.force()
    .gravity(0.01)
    .charge(-30)
    .linkDistance(60)
    .nodes(data.nodes)
    .links(data.links)
   // .size([w, h])
    .start()
   
//create the maforce.call(tip);in body + SVG elements
var svgContainer = d3.select("#area2").append("svg")	
    //.attr("width", w)
    //.attr("height", h)
     
var link = svgContainer.selectAll(".link")
    .data(data.links)
    .enter().append("line")
    .attr("class", "link");

var node = svgContainer.selectAll("image")
    .data(data.nodes)
    .enter().append("image")
    .attr("xlink:href", "/images/Bitcoin.png")
    .attr("width", coinSize)//diameter
    .attr("height", coinSize)
    .attr("r", radius - .75)
    .attr("x",-20)
    .attr("y",-20)

    //.on("mouseover", tableUpdate)
    
    //.on("mouseout", resizeCoin )
    .call(force.drag);




force.on("tick", function() {

	node.attr("cx", function(d) { return d.x = Math.max(15, Math.min(width - 15, d.x)); })
    		.attr("cy", function(d) { return d.y = Math.max(15, Math.min(height - 15, d.y)); });

	link.attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";});
	force.start();	
});

var s = 0;
var t = 1;
var started = 0;

//d3.select("#release").on("click", updateBlock);



function updateBlock(nodes){
    //window.alert("Releasing ...");
    
    //if (data.nodes.length > 1){
    //	data.links.push({"source":s++,"target":t++});
    //}
    data.nodes.push({"x":10, "y":10, "height":nodes.height, "hash": nodes.hash, "branch":nodes.branch, "previous_block_hash": nodes.previous_block_hash, "reward": nodes.reward, 'confirmations': nodes.confirmations, 'merkle_root': nodes.merkle_root, 'time': nodes.time, 'nonce':nodes.nonce, 'bits':nodes.bits, 'difficulty':nodes.difficulty, 'reward':nodes.reward, 'fees':nodes.fees, 'total_out':nodes.total_out, 'size':nodes.size, 'transactions_count':nodes.transactions_count, });
     if (data.nodes.length > 1){
	data.links.push({"source":s++,"target":t++});
     }

    //var last = data.nodes.slice(-1)[0]; 
    
    link = link.data(data.links);
    link.enter().insert("line", "image")
      .attr("class", "link");
     
    force.linkStrength(function(d,i) {
        if (d.target.index == s) return 0.01;
        return 1; })

    node = node.data(data.nodes);

    node.enter().insert("image")
        .attr("xlink:href", "/images/Bitcoin.png")
        .attr("width", coinSize)//diameter
        .attr("height", coinSize)
        .attr("x",-(coinSize/2))
        .attr("y",-(coinSize/2))
	
        .on("mouseover", tableUpdate)
        .on('mousemove', showToolTip) 
        .on('dblclick', function (d){window.open('https://blockchain.info/block/'+d.hash)})
	.on("mouseout", resizeCoin)
        .call(force.drag);
     
       	
       force.start();

}


function tableUpdate(d) {
	 d3.select(this).transition()
        .duration(50)
        .attr("width", coinSize + 10)
	.attr("height", coinSize + 10);
   
	d3.select("#datapoint1")
	   .html(d.height);
	d3.select("#datapoint2")
	   .html(d.transactions_count);
	d3.select("#datapoint3")
	   .html(d.previous_block_hash);
	d3.select("#datapoint4")
   	    .html(d.hash);
	d3.select("#datapoint5")
	   .html(d.confirmations);
	d3.select("#datapoint6")
	   .html(d.merkle_root);
	d3.select("#datapoint7")
	   .html(d.time);
	d3.select("#datapoint8")
	   .html(d.created_at);
	d3.select("#datapoint9")
	   .html(d.nonce);
	d3.select("#datapoint10")
	   .html(d.bits);
	d3.select("#datapoint11")
	   .html(d.difficulty);
	d3.select("#datapoint12")
	   .html(d.reward);
	d3.select("#datapoint13")
	   .html(d.fees);
	d3.select("#datapoint14")
	   .html(d.total_out);
	d3.select("#datapoint15")
	   .html(d.size);
	//d3.select("#datapoint16")
	  // .html(d.branch);
	//showToolTip(d);
	
}
function firstTableUpdate(d) {
	
   
	d3.select("#datapoint1")
	   .html(d.height);
	d3.select("#datapoint2")
	   .html(d.transactions_count);
	d3.select("#datapoint3")
	   .html(d.previous_block_hash);
	d3.select("#datapoint4")
   	    .html(d.hash);
	d3.select("#datapoint5")
	   .html(d.confirmations);
	d3.select("#datapoint6")
	   .html(d.merkle_root);
	d3.select("#datapoint7")
	   .html(d.time);
	d3.select("#datapoint8")
	   .html(d.created_at);
	d3.select("#datapoint9")
	   .html(d.nonce);
	d3.select("#datapoint10")
	   .html(d.bits);
	d3.select("#datapoint11")
	   .html(d.difficulty);
	d3.select("#datapoint12")
	   .html(d.reward);
	d3.select("#datapoint13")
	   .html(d.fees);
	d3.select("#datapoint14")
	   .html(d.total_out);
	d3.select("#datapoint15")
	   .html(d.size);
	//d3.select("#datapoint16")
	  // .html(d.branch);
}

function showToolTip(d){

    div.transition()       
        .duration(500)
        .style("opacity", 1); 
    div.html("Block Number "+d.height + "<br/>"+ 'click me')        
	.style('top', (d3.event.pageY - 100) + 'px')	
	.style('left',(d3.event.pageX - 390) + 'px');
}


function latestBlock(callback){
	var timer = setTimeout(function(){
	var last = data.nodes[data.nodes.length-1];
	callback(last);		
	},1000);
}

/*
 * latestblock is to run show data in table when bitcoin data loaded. delay set to 1 sec.
var last = data.nodes.slice(-1)[0];
*/


function resizeCoin(){
    d3.select(this).transition()
        .duration(50)
        .attr("width", coinSize)
        .attr("height", coinSize);
}
	
function hideTooltip(d){
    d3.select(this)
        .transition()
        .duration(50)
    div.transition()       
        .duration(1500)       
        .style("opacity", 0);  
}

resize();

window.addEventListener("resize", resize);

function resize() {

 width = elmnt.offsetWidth, height = window.innerHeight;
 svgContainer.attr("width", width).attr("height", height);
 force.size([width, height]).resume();

}


var socketbtc = Primus.connect('wss://bitcoin.toshi.io');
socketbtc.on('open', function(){
socketbtc.write({'subscribe':'blocks'});
console.log('message sent');
});

socketbtc.on('data', function incoming(evt){

var block = evt.data;
console.log('rcvd new btc'+ JSON.stringify(evt));

updateBlock(block);
triggerTime('btc');
});

socketbtc.on('reconnecting', function(opts){
console.log('reconnecting', opts.timeout);
});

socketbtc.on('error', function error(err){
console.error('error = ', err, err.message);
});

var primus = Primus.connect();


primus.on("open", function (){
      console.log('connected');
      primus.write('bitcoin');
});


//primus.on('welcome', function(msg){
//console.log(msg);
//});
primus.on("data", function incoming(data){

	console.log("new data incoming", data); 
        //var nodes = [];
       	//var nodes = JSON.parse(data);
	//console.log("nodes", nodes);
	//existingblock(nodes);
//	show();
	for (i = 0; i < data.length; i++) { 
		updateBlock(data[i]);
						
		}
	latestBlock(firstTableUpdate)
	triggerTime('btc'); 
});



primus.on('disconnection', function (spark) {
	// the spark that disconnected
	console.log("disconnected");
});
  
function show(){
//alert("new block")
$('#areatext').show()
setTimeout(function() {$("#areatext").fadeOut();}, 10000);
}

function closesocket(coin) {
	if(coin == 1){
	socketbtc.end()
	console.log('bitcoin socket closed');
	} else if (coin == 2) {
	socket.end();	
        console.log('litecoin socket closed');
	} else if (coin == 3) {
	socketdoge.end();
	console.log('dogecoin socket closed');
	}
}
