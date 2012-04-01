var settings = require("../conf/conf.js");
var maxPlayers = 2;
var tickTimer = settings.conf.tick_timer;

var onlineUsers = []; //userid array
var gameRooms = []; // room array
var gameRoomKeyMap = {};
var userDetails = []; //user array

var ticking = false;
/*
 *  Room
 *      roomId,
 *      gameType,
 *      maxPlayers
 *      players,
 *          - playerId (index)
 *          - userId
 *          - state
 *      turnOwner, (index)
 *      turns,
 *          - playerId (index)
 *          - action
 *      gameState
 *
 *
 *  User
 *      userId
 *      fullName
 *      status
 *      feed 
 *          - feedId
 *          - feedCode
 *          - fullText
 *          - active
 *
 *
 */

function setUserState(userId, state)
{
    userDetails[userId].status = state;
}
function arrayRemove(array, index)
{
    array = array.slice(0,index).concat( array.slice(index+1) );
}
 
function saveUser(name)
{
    // save user
    var index = userDetails.length;
    userDetails[index] = {};
    userDetails[index].userId = index;
    userDetails[index].fullName = name;
    setUserState(index,'online');
    userDetails[index].feed = [];
    userDetails[index].score = 0;
    return index;
}

function login(name)
{
    // save user
    var userId = saveUser(name);
    
    // set user online
    onlineUsers[onlineUsers.length] = userId;
    
    matchUsers();
    
    return userId;
    
}

function logout(userId)
{
    var index = 0;
    for(var i=0;i<onlineUsers.length;i++)
    {
        if(userId == onlineUsers[i]) 
        {
            index = i;
            break;
        }
    }
    setUserState(userId,'offline');
    arrayRemove(onlineUsers, index);
    return true;
}

function matchUsers()
{
    var matchedCount = 0;
    var players = [];
    for(var i=0;i<onlineUsers.length;i++)
    {
        var userId = onlineUsers[i];
        if(userDetails[userId].status == 'online')
        {
            players[matchedCount++] = userId;   
        }
        if(matchedCount == maxPlayers) 
        {
            initGame(players);
            matchedCount = 0;
            players = [];
        }
    } 
}

function restartGame(roomKey, turn)
{
    var room = gameRooms[gameRoomKeyMap["gr_"+roomKey]];
    room.roomKey = roomKey;
    room.turnOwner = room.turnOwner;
    room.turns = [];
    room.gameState = 'running';
    room.game = {};
    room.game.square1 = '';
    room.game.square2 = '';
    room.game.square3 = '';
    room.game.square4 = '';
    room.game.square5 = '';
    room.game.square6 = '';
    room.game.square7 = '';
    room.game.square8 = '';
    room.game.square9 = '';
    for(var i=0;i<room.players.length;i++)
    {
        setUserState(room.players[i].userId,'in-game'); 
        addToUserFeed(room.players[i].userId,'START',roomKey,'You have joined a game!',true);
        if(i==room.turnOwner) addToUserFeed(room.players[i].userId,'TURN',roomKey,'Turn',true);
    }
    gameRooms[gameRoomKeyMap["gr_"+roomKey]] = room;
}
function initGame(players)
{
    var index = gameRooms.length;
    var roomKey = generateRoomKey();
    var room = {};
    room.roomKey = roomKey;
    room.gameType = '';
    room.maxPlayers = maxPlayers;
    room.players = [];
    for(i=0;i<players.length;i++)
    {
        room.players[i] = {};
        room.players[i].playerId = i;
        room.players[i].userId = players[i];
    }
    room.turnOwner = 0;
    room.turns = [];
    room.gameState = 'running';
    room.game = {};
    room.game.square1 = '';
    room.game.square2 = '';
    room.game.square3 = '';
    room.game.square4 = '';
    room.game.square5 = '';
    room.game.square6 = '';
    room.game.square7 = '';
    room.game.square8 = '';
    room.game.square9 = '';
    for(var i=0;i<players.length;i++)
    {
        setUserState(players[i],'in-game'); 
        addToUserFeed(players[i],'START',roomKey,'You have joined a game!',true);
        if(i===0) addToUserFeed(room.players[i].userId,'TURN',roomKey,'Turn',true);
    }
    gameRooms[index] = room;
    gameRoomKeyMap["gr_"+roomKey] = index;
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

function addToUserFeed(userId, actionKey, param, text, status)
{
    var index = userDetails[userId].feed.length;
    userDetails[userId].feed[index] = {};
    userDetails[userId].feed[index].feedId = index;
    userDetails[userId].feed[index].actionKey = actionKey;
    userDetails[userId].feed[index].param = param;
    userDetails[userId].feed[index].text = text;
    userDetails[userId].feed[index].status = status;
}

function getUser(userId)
{
    return userDetails[userId];
}
function getUserFeed(userId)
{
    return userDetails[userId].feed;
}

function getRoom(roomKey)
{
    return gameRooms[gameRoomKeyMap["gr_"+roomKey]];
}

function playTurn(roomKey, userId, turn)
{
    var gameRoom = gameRooms[gameRoomKeyMap["gr_"+roomKey]];
    var playerIndex;
    for(var i = 0;i<gameRoom.players.length;i++)
    {
        if(gameRoom.players[i].userId == userId)
        {
            playerIndex = i;
        }
    }
    if(gameRoom.turnOwner == playerIndex && gameRoom.gameState == 'running' && actionValid(gameRoom,turn))
    {
        gameRoom.turns[gameRoom.turns.length] = turn;
        var mark = 'O';
        if(playerIndex % 2 === 0) mark = 'X';
        gameRoom.game[turn.action] = mark;
        gameRoom.turnOwner++;
        if(gameRoom.turnOwner == gameRoom.maxPlayers) gameRoom.turnOwner = 0;
        for(i=0;i<gameRoom.players.length;i++)
        {
            if(playerIndex != i) addToUserFeed(gameRoom.players[i].userId,'TURN',roomKey,'Turn',true);
        }
        gameRooms[gameRoomKeyMap["gr_"+roomKey]] = gameRoom;
        checkGameState(roomKey);
    }
}

function actionValid(gameRoom,turn)
{
    if(gameRoom.game[turn.action] === '') return true;
    else return false;
}

function checkGameState(roomKey)
{
    // game logic
    var gameRoom = gameRooms[gameRoomKeyMap["gr_"+roomKey]];
    var winner = -1;
    var sq1 = gameRoom.game.square1;
    var sq2 = gameRoom.game.square2;
    var sq3 = gameRoom.game.square3;
    var sq4 = gameRoom.game.square4;
    var sq5 = gameRoom.game.square5;
    var sq6 = gameRoom.game.square6;
    var sq7 = gameRoom.game.square7;
    var sq8 = gameRoom.game.square8;
    var sq9 = gameRoom.game.square9;
    
    //horizontal
    if(sq1 == sq2) if(sq1 == sq3) //row1
        {
          if(sq1 == 'X') winner = 0;
          if(sq1 == 'O') winner = 1;
        }
    if(sq4 == sq5) if(sq4 == sq6) //row2
        {
          if(sq4 == 'X') winner = 0;
          if(sq4 == 'O') winner = 1;
        }
    if(sq7 == sq8) if(sq7 == sq9) //row3
        {
          if(sq7 == 'X') winner = 0;
          if(sq7 == 'O') winner = 1;
        }
    //vertical
    if(sq1 == sq4) if(sq1 == sq7)
        {
          if(sq1 == 'X') winner = 0;
          if(sq1 == 'O') winner = 1;  
        }
    if(sq2 == sq5) if(sq2 == sq8)
        {
          if(sq2 == 'X') winner = 0;
          if(sq2 == 'O') winner = 1;  
        }
    if(sq3 == sq6) if(sq3 == sq9)
        {
          if(sq3 == 'X') winner = 0;
          if(sq3 == 'O') winner = 1;  
        }
    //diagonal
    if(sq1 == sq5) if(sq1 == sq9)
        {
          if(sq1 == 'X') winner = 0;
          if(sq1 == 'O') winner = 1;  
        }
    if(sq3 == sq5) if(sq3 == sq7)
        {
          if(sq3 == 'X') winner = 0;
          if(sq3 == 'O') winner = 1;  
        }
    
    //tie
    if(sq1 != '' && sq2 != '' && sq3 != '' && sq4 != '' && sq5 != '' && sq6 != '' && sq7 != '' && sq8 != '' && sq9 != '' && winner < 0)
    {
        for(var i = 0;i<gameRoom.maxPlayers;i++)
        {
            addToUserFeed(gameRoom.players[i].userId,'END',roomKey,'Tie',true);
        }
        restartGame(roomKey);
    }
    
    if(winner > -1) {
        gameRoom.gameState = 'finished';
        for(var i = 0;i<gameRoom.maxPlayers;i++)
        {
            if(i == winner) 
            {
                addToUserFeed(gameRoom.players[i].userId,'END',roomKey,'You Won',true);
                userDetails[gameRoom.players[i].userId].score++;
            }
            else addToUserFeed(gameRoom.players[i].userId,'END',roomKey,'You Lost',true);
        }
        restartGame(roomKey);
    }
    gameRooms[gameRoomKeyMap["gr_"+roomKey]] = gameRoom;
    
}

exports.playTurn = playTurn;
exports.getUserFeed = getUserFeed;
exports.getRoom = getRoom;
exports.getUser = getUser;
exports.login = login;
exports.logout = logout;

