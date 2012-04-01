var game = require("./game");
//settings
var settings = require("../conf/conf").conf;
var ticktimer = settings.tick_timer;
var maxTick = settings.maximum_ticks_missed;

var users = [];
var lastUserId = 1;
/*
    User
        - gameUserId
        - accountId
        - status
        - extensions
        - feed
            - feedId
            - actionKey
            - param
            - text
            - status
            - tickCount
*/

function setUserState(userId, state)
{
    for(var i=0;i<users.length;i++)
    {
        if(users[i].gameUserId == userId)
        {
            users[i].status = state;
            break;
        }
    }
}
function removeUser(userId)
{
    for(var i=0;i<users.length;i++)
    {
        if(users[i].gameUserId == userId)
        {
            users = users.slice(0,i).concat( users.slice(i+1) );
            break;
        }
    }
    
}

function addUser(accountId, extension, status)
{
    console.log("adduser called: " + accountId + ',' + extension + ',' + status);
    // save user
    var index = users.length;
    users[index] = {};
    users[index].gameUserId = lastUserId++;
    users[index].accountId = accountId;
    users[index].extension = extension;
    users[index].lastFeedIndex = 0;
    users[index].feed = [];
    setUserState(index,status);
    return users[index].gameUserId;
}

function login(accountId, extension, status)
{
    // save user
    var userId = addUser(accountId, extension, status);
    return userId;
    
}

function logout(userId)
{
    removeUser(userId);
    return true;
}

function addToUserFeed(userId, actionKey, param, text)
{
    for(var i=0;i<users.length;i++)
    {
        if(users[i].gameUserId == userId)
        {
            var index = users[i].feed.length;
            users[i].feed[index] = {};
            users[i].feed[index].feedId = index;
            users[i].feed[index].actionKey = actionKey;
            users[i].feed[index].param = param;
            users[i].feed[index].text = text;
            users[i].feed[index].status = 'new';
            break;
        }
    }
    
}

function getUser(userId)
{
    for(var i=0;i<users.length;i++)
    {
        if(users[i].gameUserId == userId)
        {
            return users[i];
        }
    }
    return {};
}
function getUserFeed(userId)
{
    for(var i=0;i<users.length;i++)
    {
        if(users[i].gameUserId == userId)
        {
            return users[i].feed;
        }
    }
    return [];
}

function userPing(userId)
{
    for(var i=0;i<users.length;i++)
    {
        if(users[i].gameUserId == userId)
        {
            users[i].tickCount=0;
        }
    }
}

function tick()
{
    for(var i=0;i<users.length;i++)
    {
        console.log('online user'+i+': ' + users[i].gameUserId);
        users[i].tickCount++;
        if(users[i].tickCount == maxTick)
        {
            game.logout(users[i].userId);
            //TODO: notify gameserver!
        }
    }   
    setTimeout(function(){tick();},ticktimer);
}

function getUsersWaitingRandomMatch()
{
    var res = [];
    console.log('users len: ' + users.length);
    for(var i=0;i<users.length;i++)
    {
        console.log('i value: ' + i);
        if(users[i].status == 'lfrandom')
        {
            console.log('added in pos: ' + res.length);
            res[res.length] = users[i];
        }
    }
    console.log('return len: ' + res.length);
    return res;   
}

tick();

exports.getUsersWaitingRandomMatch = getUsersWaitingRandomMatch;
exports.userPing = userPing;
exports.addToUserFeed = addToUserFeed;
exports.getUser = getUser;
exports.getUserFeed = getUserFeed;
exports.logout = logout;
exports.login = login;
exports.setUserState = setUserState;
