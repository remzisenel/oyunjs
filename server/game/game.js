/*
user.js 
------------------------------------
exports.getUsersWaitingRandomMatch = getUsersWaitingRandomMatch;
exports.userPing = userPing;
exports.addToUserFeed = addToUserFeed;
exports.getUser = getUser;
exports.getUserFeed = getUserFeed;
exports.logout = logout;
exports.login = login;
exports.setUserState = setUserState;
------------------------------------

room.js
------------------------------------
exports.addTurn = addTurn;
exports.restartGame = restartGame;
exports.initGame = initGame;
exports.getRoom = getRoom;
------------------------------------
*/
var user = require("./user");
var room = require("./room");
var settings = require("../conf/conf").conf;
var ticktimer = settings.mm_tick_timer;
var ext_extList = settings.extList;
var ext_extensions = settings.extensions;
var ticking = {};
var extensions = {};
var userIdRoomMap = {};

for(var ext_i = 0;ext_i<ext_extList.length;ext_i++)
{
    extensions[ext_extList[ext_i]] = require("../"+ext_extensions[ext_extList[ext_i]]);
    ticking[ext_extList[ext_i]] = false;
}

function matchUsers(extension)
{
    var users = user.getUsersWaitingRandomMatch();
    var maxPlayers = extensions[extension].maxPlayers;
    var players = [];
    var playerCount = 0;
    for(var i=0;i<users.length;i++)
    {
        if(users[i].extension == extension)
        {
            players[players.length] = users[i];   
            playerCount++;
        }
        if(playerCount == maxPlayers)
        {
            var roomKey = room.initGame(players, extension);
            for(var j=0;j<players.length;j++)
            {
                userIdRoomMap[players[j].gameUserId] = roomKey;
                var gameRoom = room.getRoom(roomKey);
                user.setUserState(players[j].gameUserId, 'in-game');
                user.addToUserFeed(players[j].gameUserId, 'START', roomKey, gameRoom);  
                user.addToUserFeed(players[j].gameUserId, 'STATE', roomKey, gameRoom.game);  
                if(j==gameRoom.turnOwner) user.addToUserFeed(players[j].gameUserId, 'TURN', roomKey, '{}');
            }
            playerCount = 0;
            players = [];
        }
    }
    /*if(!ticking[extension]) 
    {
        ticking[extension] = true;
        tick(extension);
    }*/
}

function login(accountId, extension, status)
{
    var res = user.login(accountId, extension, status);
    if(res && status == 'lfrandom') matchUsers(extension);
    return res;
}

function logout(userId)
{
    var res = user.logout(userId);
    var roomKey = userIdRoomMap[userId];
    var gameRoom = room.getRoom(roomKey);
    room.setState(roomKey, 'halt');
    for(var i=0;i<gameRoom.players.length;i++)
    {
        if(gameRoom.players[i].userId != userId)
        {
            user.addToUserFeed(gameRoom.players[i].userId, 'STATE', roomKey, gameRoom.game);    
            user.addToUserFeed(gameRoom.players[i].userId, 'END', -1);    
            user.setUserState(gameRoom.players[i].userId, 'lfrandom');
        }
    }
    return res;
}

function getUser(userId)
{
    var res = user.getUser(userId);
    return res;
}

function getRoom(roomKey)
{
    var res = room.getRoom(roomKey);
    return res;
}

function getUserFeed(userId)
{
    var res = user.getUserFeed(userId);
    user.userPing(userId);
    return res;
}

function playTurn(userId, roomKey, turn)
{
    var gameRoom = room.getRoom(roomKey);
    var playTurnResponse = extensions[gameRoom.gameType].playTurn(userId, gameRoom, turn);
    if(playTurnResponse.result == 'success')
    {
        room.setGame(roomKey, playTurnResponse.game);
        room.addTurn(roomKey, turn);
        room.setState(roomKey, playTurnResponse.state);
        gameRoom = room.getRoom(roomKey);
        console.log(JSON.stringify(gameRoom));
        if(playTurnResponse.state == 'run')
        {
            for(var i=0;i<gameRoom.players.length;i++)
            {
                user.addToUserFeed(gameRoom.players[i].userId, 'STATE', roomKey, gameRoom.game);    
                if(gameRoom.turnOwner == i)
                {
                    
                    user.addToUserFeed(gameRoom.players[i].userId, 'TURN', roomKey, '{}');    
                }
            }
        }
        if(playTurnResponse.state == 'halt')
        {
            for(var i=0;i<gameRoom.players.length;i++)
            {
                user.addToUserFeed(gameRoom.players[i].userId, 'STATE', roomKey, gameRoom.game);    
                user.addToUserFeed(gameRoom.players[i].userId, 'END', roomKey, playTurnResponse.winner);    
                user.setUserState(gameRoom.players[i].userId, 'lfrandom');
            }
        }
    }
    

}

function tick(extension)
{
    matchUsers(extension);
    setTimeout(function(){tick(extension);},ticktimer);    
}

exports.playTurn = playTurn;
exports.getUserFeed = getUserFeed;
exports.getRoom = getRoom;
exports.getUser = getUser;
exports.login = login;
exports.logout = logout;

