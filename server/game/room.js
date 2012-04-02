//settings
var settings = require("../conf/conf").conf;
var ticktimer = settings.room_tick_timer;
var maxTick = settings.room_maximum_ticks_missed;
var ext_extList = settings.extList;
var ext_extensions = settings.extensions;
var extensions = {};
for(var ext_i = 0;ext_i<ext_extList.length;ext_i++)
{
    extensions[ext_extList[ext_i]] = require("../"+ext_extensions[ext_extList[ext_i]]);
}

var rooms = {};
var roomKeys = [];

function restartGame(roomKey)
{
    var room = rooms["gr_"+roomKey];
    room.roomKey = roomKey;
    room.players = [];
    room.turns = [];
    room.tick = 0;
    room.gameState = 'run';
    room.game = extensions[room.gameType].initialState();
    
    rooms["gr_"+roomKey] = room;
}

function initGame(players, extension)
{
    var roomKey = generateRoomKey();
    var room = {};
    room.roomKey = roomKey;
    room.gameType = extension;
    room.maxPlayers = extensions[room.gameType].maxPlayers;
    room.players = [];
    for(var i=0;i<players.length;i++)
    {
        room.players[i] = {};
        room.players[i].playerId = i;
        room.players[i].userId = players[i].gameUserId;
        room.players[i].accountId = players[i].accountId;
    }
    room.turnOwner = 0;
    room.turns = [];
    room.tick = 0;
    room.gameState = 'run';
    room.game = extensions[room.gameType].initialState();
    
    rooms["gr_"+roomKey] = room;
    roomKeys[roomKeys.length] = roomKey;
    return roomKey;
}

function generateRoomKey()
{
    var keylen = 32;
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var randomstring = '';
    for (var i=0; i<keylen; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

function getRoom(roomKey)
{
    return rooms["gr_"+roomKey];
}

function addTurn(roomKey, turn)
{
    rooms["gr_"+roomKey].turns[rooms["gr_"+roomKey].turns.length] = turn;
    rooms["gr_"+roomKey].turnOwner++;
    if(rooms["gr_"+roomKey].turnOwner % rooms["gr_"+roomKey].maxPlayers === 0) rooms["gr_"+roomKey].turnOwner =0;
}

function setState(roomKey, state)
{
    rooms["gr_"+roomKey].gameState = state;
}

function tick()
{
    for(var i=0;i<roomKeys.length;i++)
    {
        if(rooms["gr_"+roomKeys[i]] && rooms["gr_"+roomKeys[i]].gameState == 'halt')
        {
            rooms["gr_"+roomKeys[i]].tick++;
            if(rooms["gr_"+roomKeys[i]].tick == maxTick)
            {
                removeRoom(i);
            }
        }
    }   
    setTimeout(function(){tick();},ticktimer);
}

function removeRoom(i)
{
    //TODO: notify gameserver
    rooms["gr_"+roomKeys[i]] = null;
    roomKeys = roomKeys.slice(0,i).concat( roomKeys.slice(i+1) );
}

function setGame(roomKey, game)
{
    rooms["gr_"+roomKey].game = game;   
}

tick();

exports.setGame = setGame;
exports.setState = setState;
exports.addTurn = addTurn;
exports.restartGame = restartGame;
exports.initGame = initGame;
exports.getRoom = getRoom;