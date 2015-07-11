// connect to the socket server
var socket = io.connect('http://localhost:3000');
socket.on('news', function(json){
	console.log(json);
	socket.emit('pong');
}) 

