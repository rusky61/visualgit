var coin = 2;
//localStorage.setItem('coins', 'ltc');
//var x = localStorage.getItem('coins');
/*
 *For inline text descriptions see d3visual.js 
 *Code at end shows using websocket packege and reconnet. changed to primus.
 *
 */





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
   //.style("opacity", 0);



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
    .attr("xlink:href", "/images/litecoin.png")
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
        .attr("xlink:href", "/images/Litecoin.png")
        .attr("width", coinSize)//diameter
        .attr("height", coinSize)
        .attr("x",-(coinSize/2))
        .attr("y",-(coinSize/2))
	
        .on("mouseover", tableUpdate)
        .on('mousemove', function(d){
	/*
	var matrix = this.getScreenCTM()
	.translate(+this.getAttribute("cx"),
		   +this.getAttribute("cy"));
   */
	  
    div.transition()       
        .duration(500)
        .style("opacity", 1); 
    div.html("Block Number "+d.height +"</br>"  + "Number of transations in block: " + "<span style='color:red; font-size:20px'>" + d.transactions_count + "</span>"+"</br>"+ "dbl click me for more info")     
//	.style('top', (d3.event.pageY - 100) + 'px')	
//	.style('left',(d3.event.pageX - 390) + 'px');
	.style("left",
	       (d.x + 50 + "px"))
	.style("top",
	       (d.y +"px"));
	})
     
        .on('dblclick', function (d){window.open('https://www.block-explorer.com/block/'+d.hash)})
	.on("mouseout", function (d) {
		
		hideTooltip.call(this, d);
                resizeCoin.call(this, d);})

        .call(force.drag);
     
       	
       force.start();
}

function latestBlock(callback){
	var timer = setTimeout(function(){
	var last = data.nodes[data.nodes.length-1];
	callback(last);		
	},1000);
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
//	showToolTip(d);
	
}

    
/*
function latestBlock(){
	
var last = data.nodes.slice(-1)[0] 
console.log(last.height)
	return last.height;
	// d3.select("#datapoint16")
	  // .html(last.height);
}
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
//instead used JQUERY function to resize svg on scroll event.
$(window).scroll(function(){
height = $(window).scrollTop()+$(window).height();	
if($(window).scrollTop() + $(window).height() < $(document).height()-20){
	
svgContainer.attr("width",width).attr("height", height);

}
force.size([width, height]).resume();

});

window.addEventListener("resize", resize);

function resize() {

 width = elmnt.offsetWidth, height = window.innerHeight;
 svgContainer.attr("width", width).attr("height", height);
 force.size([width, height]).resume();

}

var primus = Primus.connect();
	primus.on("open", function (){
        console.log("connected ");
	primus.write('litecoin');
	

});

var socket = Primus.connect('wss://litecoin.toshi.io');


socket.on('open', function(){

socket.write({'subscribe': 'blocks'});
console.log('message sent');
});

socket.on('data', function incoming(evt){
	var block = evt.data
	console.log('received new lites '+ JSON.stringify(evt)); 

	updateBlock(block);
	triggerTime();

});


/* 
var primus = Primus.connect('wss://socket.blockcypher.com/v1/ltc/main');
var primus  = Primus.connect('wss://ws.dogechain.info/inv');
'wss://n.block.io'
socket.write({network: 'LTC', type:'new-blocks'});
var primus = new primus.Socket('wss://socket.blockcypher.com/v1/ltc/main');
primus.on('open', function(){
	console.log('hello');
	//	ws.send(JSON.stringify({filter: 'event=new-block'}));
	primus.write{filter: 'event=new-block'});
	console.log('message sent');
});

var reconnectInterval = 1000;
var connect = function(){
var ws  = new WebSocket('wss://socket.blockcypher.com/v1/ltc/main');

ws.onopen = function(evt){
	//websocket is connected, send data using send()
	ws.send(JSON.stringify({filter: 'event=new-block'}));
//	ws.send(JSON.stringify({op:'blocks_sub'}));
	console.log('message sent');
};

ws.onmessage = function (evt) {
	var received_msg = JSON.parse(evt.data);
	console.log('new block'+ received_msg);
	updateBlock(received_msg);

};

ws.onclose = function(evt){
	console.log('connection closed');
	setTimeout(connect, reconnectInterval);
};
}
connect();
*/
primus.on("data", function incoming(data){

	console.log("new data incoming", data); 
        //var nodes = [];
       	//var nodes = JSON.parse(data);
	//console.log("nodes", nodes);
	//existingblock(nodes);
	show();
	for (i = 0; i < data.length; i++) { 
		updateBlock(data[i]);
                						
	}
		triggerTime();
		latestBlock(firstTableUpdate);
});



function show(){
//alert("new block")
$('#areatext').show()
setTimeout(function() {$("#areatext").fadeOut();}, 10000);
}

function tableOnload(){
var last = data.nodes.slice(-1)[0];
tableUpdate(last);
}
/*
primus.on('disconnection', function (spark) {
	// the spark that disconnected
	console.log("disconnected");
});
*/
//This new event to get latest block from updateblock.js file. was testing. worked from www but not updateblock.js
//primus.on('newblock', function(data){
//	var james = [];
//	var james = JSON.parse(data)
//	console.log(james);
//});
  

