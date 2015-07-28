//var x = localStorage.getItem('coins');
var coin = 1;
//localStorage.setItem('coins', "btc");


var data = {
	           "nodes":[
		   ],
		   "links":[
		   ]
    };


var elmnt = document.getElementById("area2");
        
/*
 *Global variables
 */
var radius = 6;
  
var coinSize = 40;
var t0 = Date.now();


 var div = d3.selectAll("#area2").append("div")
 //	.selectAll("image")   
	.attr("class", "tooltip")               
        .style("opacity", 0);

show();

/*
 * Step 3: D3 force layout setup. Create force layout object and define the properties.
*/
var force = d3.layout.force()
    .gravity(0.01)
    .charge(-30)
    .linkDistance(60)
    .nodes(data.nodes)
    .links(data.links)
   // .size([w, h])
   // .start()
   
/*
 *Step 2: Select the DOM element area2 and append an SVG element to it that will be used for the visualisation.
 */ 
var svgContainer = d3.select("#area2").append("svg")	  

/*
 *Step 4: Add links to the visualisation. attr() used to set HTML attributes.
 */
var link = svgContainer.selectAll(".link")
    .data(data.links)
    .enter().append("line")
    .attr("class", "link");

/*
 *Step 4: Add nodes to the visualisation. attr() used to set HTML attributes. e.g. append bitcoin image.set width, height, radius
 */
var node = svgContainer.selectAll("image")
    .data(data.nodes)
    .enter().append("image")
    .attr("xlink:href", "/images/Bitcoin.png")
    .attr("width", coinSize)//diameter
    .attr("height", coinSize)
    .attr("r", radius - .75)
    .attr("x",-20)
    .attr("y",-20)
    .call(force.drag);
/*
 *.call(force.drag) used to allow interactive dragging when a user selects a node.
 */

/*
 *Step 5
 *force.on(tick)event listener that updates all nodes to new positions.
 * Also updates positions of the links.
 */

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



function updateBlock(nodes){
    data.nodes.push({"x":10, "y":10, "height":nodes.height, "hash": nodes.hash, "branch":nodes.branch, "previous_block_hash": nodes.previous_block_hash, "reward": nodes.reward, 'confirmations': nodes.confirmations, 'merkle_root': nodes.merkle_root, 'time': nodes.time, 'nonce':nodes.nonce, 'bits':nodes.bits, 'difficulty':nodes.difficulty, 'reward':nodes.reward, 'fees':nodes.fees, 'total_out':nodes.total_out, 'size':nodes.size, 'transactions_count':nodes.transactions_count, });
     if (data.nodes.length > 1){
	data.links.push({"source":s++,"target":t++});
     }
    
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
        .on('mousemove', function(d){
	/*
	var matrix = this.getScreenCTM()
	.translate(+this.getAttribute("cx"),
		   +this.getAttribute("cy"));
   */
	  
    div.transition()       
        .duration(500)
        .style("opacity", 1); 
    div.html("Block Number "+d.height + "<br/>"+ 'dbl click me')        
//	.style('top', (d3.event.pageY - 100) + 'px')	
//	.style('left',(d3.event.pageX - 390) + 'px');
	.style("left",
	       (d.x + 50 + "px"))
	.style("top",
	       (d.y +"px"));
	})
	   
	   
	   
	   
	   
        .on('dblclick', function (d){window.open('https://blockchain.info/block/'+d.hash)})
	.on("mouseout", function (d) {
		
		hideTooltip.call(this, d);
                resizeCoin.call(this, d);})
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


/*event listeners to resize svg. scroll uses pageYoffset to ensure svg resizes.
*resize used to set width height onload.
*/
resize();
window.addEventListener("resize", resize);

/*
*Easier to have jquery event listener for scrolling. works better but still not convinced this is correct;
*/
$(window).scroll(function(){
height = $(window).scrollTop()+$(window).height();	
if($(window).scrollTop() + $(window).height() < $(document).height()-20){
	
svgContainer.attr("width",width).attr("height", height);

}
force.size([width, height]).resume();

});


/*
 *Resize SVG on resize of window.
 */
function resize() {

	width = elmnt.offsetWidth, height = window.innerHeight + window.pageYOffset;
 	svgContainer.attr("width", width).attr("height", height);
 	force.size([width, height]).resume();
}
/*
 *Step 6: websocket to bitcoin.toshi to fetch most recent block.
 *
 */

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
