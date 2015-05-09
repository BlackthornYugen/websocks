/* 
Ping & IP Hashing w/ Websockets
@author  John Steel
@version 0.3
@date    Febuary 27, 2015
*/
var util = require("util"),
    io = require("socket.io")(),
	port = process.env.PORT || 8000;
	
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");

var players = [], // I say players because I plan on making this into a small game
    events = 0; // Keep track of events
 
// Do this each time a client connects //
io.on('connection', function(client){
    util.log( "New Connection!"
	  + "\nClient ID: "
	  + client.id 
	  + "\nClient IP: "
	  + client.conn.remoteAddress 
	  + "\nFrom:      " 
	  + client.conn.request.headers.referer
	  + "\nHash:      " 
	  + getIPHash(client.conn.remoteAddress)
	  + "\n");
    players.push(client);
    client.on("disconnect", onClientDisconnect);
    client.on("ping", onClientPing);
    client.on("goodbye", onPart);
    client.on("msg", onMessage); 
    client.on("evenOdd", checkEvenOdd);
    client.on("playerHash", onPlayerHash);
	
	var ns = io.of("/");
	for(x in ns.connected) {
		var player = ns.connected[x];
		if(player.id !== client.id) {
			var response = getPlayerHash(client.id);
			response.isNew = true;
			player.emit("newPlayer", response);
		}
	}
});
 
function onClientPing(data) {
    events++;
	var msg = "This message came from nodejs";
	if(this.conn.request.headers.referer.indexOf("bumuvo/3/") > 0){
	  msg = "jsbin.com/bumuvo/3/ is broken, try jsbin.com/bumuvo/";
	}
	var ns = io.of("/"); // the root namespace
    this.emit('pong', { // Send a reply to the ping; include some server data.
        message: msg,
        uptime: Math.round(process.uptime()),
        players: Object.keys(ns.connected),
        connected: Object.keys(ns.connected).length,
        numEvents:events});
    util.log(this.id + " Ping!");
    if(data) util.log(data);
};
 
function onClientDisconnect(client) {
    events++;
    players.splice(players.indexOf(client.id),1);
    util.log("Player has disconnected: "+this.id);
	
	var ns = io.of("/");
	for(x in ns.connected) {
		var player = ns.connected[x];
		if(player.id !== this.id) {
			player.emit("playerDisconnected", this.id);
		}
	}
};
 
function onPart(data, ack){
    events++;
    ack("Goodbye " +this.id+ "! \n  --nodejs");
    this.disconnect();
    if(data) util.log(data);
}
 
function onMessage(data, ack) {
    events++;
    if (ack) next(data+"?!?");
};
 
function checkEvenOdd(input, ack) {
    events++;
    if(isNaN(input)){
        ack('Not a number.');
    } else if (+input % 2 === 0) {
        ack('even');
    } else {
        ack('odd');
    }
};
 
function onPlayerHash(data, ack) {
    events++;
	var response = getPlayerHash(data);
	if (this.id == data) response.isMe = true;
	ack(response);
}

function getPlayerHash(playerId){
	var hashObject = {};
	var ns = io.of("/");
	var player = ns.connected[playerId];
	if(player){
		hashObject.hash = getIPHash(player.conn.remoteAddress);
		hashObject.identCode = player.id;
		hashObject.referer = player.conn.request.headers.referer;
	} else {
		hashObject.error = playerId + " is not a valid player id.";
	}
	return hashObject;
}

function getIPHash(ip){
	try{
		var hash = SHA256(ip);
		return parseInt(hash, 16) % Math.pow(10,8);
	} catch (e) {
		util.log(e);
	}
	return 999;
}

io.listen(port);
