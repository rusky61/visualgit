var data = {
    "nodes":[],
	"links":[]
};

/*
 *Global variables
 */
var t0 = Date.now();
var s = 0;
var t = 1;
var currentCoin = "btc";

var coins = {
	btc : {fullname:'bitcoin',img:"/images/Bitcoin.png"},
	ltc : {fullname:'litecoin',img:"/images/Litecoin.png"},
	doge: {fullname:'dogecoin',img:"/images/dogecoin.png"},
}

var d = new function(){
	this.elmnt = document.getElementById("area2");
	this.div = d3.selectAll("#area2").append("div")
 		.attr("class", "tooltip")               
	    .style("opacity", 0);
	this.force;
	this.link;
	this.node;
	this.svgContainer = d3.select("#area2").append("svg"); 
	this.coinSize = 40;
	this.radius = 6
}

/*
 * Step 3: D3 force layout setup. Create force layout object and define the properties.
*/
   
/*
 *Step 2: Select the DOM element area2 and append an SVG element to it that will be used for the visualisation.
 */ 
/*
 *Step 4: Add links to the visualisation. attr() used to set HTML attributes.
 */
/*
 *Step 4: Add nodes to the visualisation. attr() used to set HTML attributes. e.g. append bitcoin image.set width, height, radius
 */

function initD3Objects(){
	d.force = d3.layout.force()
	    .gravity(0.01)
	    .charge(-30)
	    .linkDistance(60)
	    .nodes(data.nodes)
	    .links(data.links);

	d.node = d.svgContainer.selectAll("image")
	    .data(data.nodes)
	    .enter().append("image")
	    .attr("xlink:href", coins[currentCoin].img)
	    .attr("width", d.coinSize)//diameter
	    .attr("height", d.coinSize)
	    .attr("r", d.radius - .75)
	    .attr("x",-20)
	    .attr("y",-20);
	    //.call(d.force.drag);

    d.link = d.svgContainer.selectAll(".link")
	    .data(data.links)
	    .enter().append("line")
	    .attr("class", "link");

}

initD3Objects();

/*
 *.call(force.drag) used to allow interactive dragging when a user selects a node.
 */

/*
 *Step 5
 *force.on(tick)event listener that updates all nodes to new positions.
 * Also updates positions of the links.
 */

d.force.on("tick", function() {

	d.node.attr("cx", function(d) { return d.x = Math.max(15, Math.min(width - 15, d.x)); })
    		.attr("cy", function(d) { return d.y = Math.max(15, Math.min(height - 15, d.y)); });

	d.link.attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	d.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";});
});


/*
It not possible to change strenght during animation :(
function scheduleStrengthReset(){
	if (scheduleStrengthReset.scheduled === undefined){
		console.log('scheduleStrengthReset set');
		setTimeout(function() {
			d.force.stop();
			d.force.linkStrength(1);
	    	d.force.start();
	    	console.log('scheduleStrengthReset executed');
	    	delete scheduleStrengthReset.scheduled;
		}, 2000); 
		scheduleStrengthReset.scheduled = true;
	}
}*/


/*
 *Main function that pushes latest 100 blocks received from Pi and also from external websocket api + updates visualisation.
 *Start source on 0 and target on 1 then increment. links nodes to the previous one. if orphans then would need to be changed.
 */

function updateD3Block(nodes){
	if (nodes === undefined) return;

    data.nodes.push({"x":10, "y":10, "height":nodes.height, "hash": nodes.hash, "branch":nodes.branch, "previous_block_hash": nodes.previous_block_hash, 'confirmations': nodes.confirmations, 'merkle_root': nodes.merkle_root, 'time': nodes.time, 'nonce':nodes.nonce, 'bits':nodes.bits, 'difficulty':nodes.difficulty, 'reward':nodes.reward, 'fees':nodes.fees, 'total_out':nodes.total_out, 'size':nodes.size, 'transactions_count':nodes.transactions_count, });
    
    if (data.nodes.length > 1){
		data.links.push({"source":s++,"target":t++});
    }
    
    d.link = d.link.data(data.links);
    d.link.enter().insert("line", "image")   
    	.attr("class", "link");
      
    d.force.linkStrength(function(d,i) {
    	if (d.target.index == s) return 0.01;
    	return 1; 
    });

    d.node = d.node.data(data.nodes);

    d.node.enter().insert("image")
    	.attr("xlink:href", coins[currentCoin].img)
        .attr("width", d.coinSize)//diameter
        .attr("height", d.coinSize)
        .attr("x",-(d.coinSize/2))
        .attr("y",-(d.coinSize/2))
	
        .on("mouseover", tableUpdate)
        .on('mousemove', coinOnMouseMove)
    	.on('dblclick', coinOnMouseDbClick)
		.on("mouseout", coinOnMouseOut)
    	.call(d.force.drag);
    
    d.force.start();
    //scheduleStrengthReset();
}

function coinOnMouseOut (el) {
	hideTooltip.call(this, el);
	resizeCoin.call(this, el);
}

function coinOnMouseDbClick(el){
	window.open('https://blockchain.info/block/'+el.hash)
}

function coinOnMouseMove(el){
	d.div.transition()       
		.duration(500)
		.style("opacity", 1); 
	d.div.html("Block Number "+el.height +"</br>"  + "Number of transations in block: " + "<span style='color:red; font-size:20px'>" + el.transactions_count + "</span>"+"</br>"+ "dbl click me for more info")
		.style("left",(el.x + 50 + "px"))
		.style("top",(el.y +"px"));
}
/*
 *Updates table on mouseover event.
 */

function tableUpdate(el) {
	 d3.select(this).transition()
        .duration(50)
        .attr("width", d.coinSize + 10)
		.attr("height", d.coinSize + 10);
   
	d3.select("#datapoint1")
	   .html(el.height);
	d3.select("#datapoint2")
	   .html(el.transactions_count);
	d3.select("#datapoint3")
	   .html(el.previous_block_hash);
	d3.select("#datapoint4")
   	    .html(el.hash);
	d3.select("#datapoint5")
	   .html(el.confirmations);
	d3.select("#datapoint6")
	   .html(el.merkle_root);
	d3.select("#datapoint7")
	   .html(el.time);
	d3.select("#datapoint8")
	   .html(el.created_at);
	d3.select("#datapoint9")
	   .html(el.nonce);
	d3.select("#datapoint10")
	   .html(el.bits);
	d3.select("#datapoint11")
	   .html(el.difficulty);
	d3.select("#datapoint12")
	   .html(el.reward);
	d3.select("#datapoint13")
	   .html(el.fees);
	d3.select("#datapoint14")
	   .html(el.total_out);
	d3.select("#datapoint15")
	   .html(el.size);
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
        .attr("width", d.coinSize)
        .attr("height", d.coinSize);
}
	
function hideTooltip(el){
    d3.select(this)
        .transition()
        .duration(50)
    d.div.transition()       
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
		d.svgContainer.attr("width",width).attr("height", height);
	}
	d.force.size([width, height]).resume();

});


/*
 *Resize SVG on resize of window.
 */
function resize() {
	width = d.elmnt.offsetWidth, height = window.innerHeight + window.pageYOffset;
 	d.svgContainer.attr("width", width).attr("height", height);
 	d.force.size([width, height]).resume();
}

/*
 * Create primus object to open connection with Pi and recieve latest 100 blocks.
 *  client tells pi that it wants bitcoin JSON.
 *  firstTableUpdate function  updates table with block data.
 */


var primus = Primus.connect();

primus.on("open", function (){
      console.log('connected');
      //var lastHeight = data.nodes.length > 0 ? data.nodes[data.nodes.length-1].height : -1
      primus.write({'subscribe':currentCoin});
});


//primus.on('welcome', function(msg){
//console.log(msg);
//});
primus.on("data", function incoming(data){

	console.log("new data incoming: ", data); 

	if (data.op === 'block'){
		if (data.coin === currentCoin){
			updateD3Block(data.data);
			latestBlock(firstTableUpdate)
			triggerTime('btc'); 
		}
		
	}
	
});



primus.on('disconnection', function (spark) {
	// the spark that disconnected
	console.log("disconnected");
});

function reloadBlocks(coinName){
	data.nodes.length = 0;
	data.links.length = 0;
	d.svgContainer.selectAll(".link").remove();
	d.svgContainer.selectAll("image").remove();
	s = 0;
	t = 1;
	currentCoin = coinName;
	primus.write({'subscribe':coinName})

}
  
/*
 *Show  notification while page loads (e.g. please wait blocks loading)
 */

function show(){
	//alert("new block")
	$('#areatext').show()
	setTimeout(function() {
		$("#areatext").fadeOut();
	}, 10000);
}
