

/*
var i, timer, divide;
i=0;
divide=100;

function start(){
	timer = setInterval(increment, (1000/divide))
//console.log('timer triggered');
}

function increment(){
	i++
	document.getElementById('watch').innerHTML= (i/divide);
}
*/
	
//var h1 = document.getElementById('watch');
var seconds = 0;
var minutes = 0;
var timer;

function add(){
	seconds++;
	if(seconds>=60) {
		seconds=0;
		minutes++;
		}
//h1.textcontent = (minutes ?( minutes > 9 ? minutes : '0' + minutes) : '00') + ':' + (seconds > 9 ? seconds : '0' +seconds);
		document.getElementById('watch').innerHTML = extraZero(minutes) + ':' + extraZero(seconds); 
		startwatch();
}

function startwatch(){
	timer = setTimeout(add, 1000);
}


function reset(){
	clearInterval(timer);
	timer = null;
	seconds = 0;
	minutes = 0;
	document.getElementById('watch').innerHTML = '00:00'
        startwatch();
}

function triggerTime (coin) {
	var x = minutes;
	var y = seconds;	

 setPrevTime(coin, x, y);
 reset();
}

function extraZero(i){
if (i<10){
	i = '0' + i
	}
	return i;
}


function setPrevTime(coin, x, y){
	if (coin =='btc'){	
		if(x == 0 && y == 0){
		document.getElementById('prevtime').innerHTML = '10:00';	
		}else {
		document.getElementById('prevtime').innerHTML = extraZero(x) +':' + extraZero(y);
		}
	}else if (coin =='ltc'){ 
		if(x == 0 && y == 0){
		document.getElementById('prevtime').innerHTML = '02:30';	
		}else {
		document.getElementById('prevtime').innerHTML = extraZero(x) +':' + extraZero(y);
		
		}
	}else{ (coin =='doge') 
		if(x == 0 && y == 0){
		document.getElementById('prevtime').innerHTML = '01:30';	
		}else {
		document.getElementById('prevtime').innerHTML = extraZero(x) +':' + extraZero(y);
		
		}
	}
	
}











