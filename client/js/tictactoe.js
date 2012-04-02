var serverurl = 'http://ec2-46-137-135-65.eu-west-1.compute.amazonaws.com/game/';
var debug = false;
var userId = -1;
var feed = [];
var lastActionFeedId = -1;
var room = {}; 
var ticktimer = 5000;
var lock = false;
var players = [];

$('#content').hide();

$(window).unload(function() {
    var req = {};
	req.userId = userId;
	$.post(serverurl+"logout", { req: JSON.stringify(req) });
});

//start('remzi');

function start(name)
{
	$('#content').show();
	$('#start').hide();
	$('#nameTag0').hide();
	$('#nameTag1').hide();
	initGS(name);
}

function log(message)
{
	if(debug) $('#console').html($('#console').html()+'<p>'+message+'</p>');
}

function enableControls()
{
	$(".g_sq").bind('click', function() {
		picked($(this).attr('id'));
	});
}

function disableControls()
{
	$(".g_sq").unbind('click');
}

function picked(elm)
{
	if(!lock) 
	{
		lock = true;
		disableControls();
		var req = {};
		req.roomKey = room.roomKey;
		req.userId = userId;
		req.turn = {};
		req.turn.action = elm;
		$.post(serverurl+"playTurn", { req: JSON.stringify(req) } , function(data) {
			lock = false;
			if(data.status == 'success')
			{
				disableControls();
				setMessage('Waiting for opponent...');
			}
			else
			{
                enableControls();
                setMessage('Error sending turn, try again');
				log('ERROR: status != success');
			}
		});
	}
}

function initGS(fullname)
{
	log('init gs connection');
	var req = {};
	req.name = fullname;
    req.extension = 'ttt';
    req.status = 'lfrandom';
	$.post(serverurl+"login", { req: JSON.stringify(req) } , function(data) {
		if(data.status == 'success')
		{
			userId = data.response.userId;
			setMessage('Connected to server, waiting for opponent');
			tick();
		}
		else
		{
			log('ERROR: status != success');
		}
		log('userid=' + userId);
	});
}

function getUserFeed()
{
	var req = {};
	req.userId = userId;
	$.post(serverurl+"getUserFeed", { req: JSON.stringify(req) } , function(data) {
		if(data.status == 'success')
		{
			feed = data.response.feed;
			parseFeedActions();
		}
		else
		{
			log('ERROR: status != success on getUserFeed');
		}
	});
}

function parseFeedActions()
{
    var endwait = false;
	for(var i = lastActionFeedId+1;i<feed.length;i++)
	{
		if(feed[i].actionKey == 'START')
		{
			setMessage('Joined Room');
			log('game start received');
            room = feed[i].message;
            updateBoard();
            updateUsers();
			
		}
		if(feed[i].actionKey == 'TURN')
		{
			setMessage('Your Turn');
			log('turn received');
            enableControls();
		}
        if(feed[i].actionKey == 'STATE')
        {
            room.game = feed[i].message;
            updateBoard();
		}
		if(feed[i].actionKey == 'END')
		{
            var winnerUserId = feed[i].message;
            if(winnerUserId > 0) setMessage('Game Over. Winner: ' + winnerUserId);
            else if(winnerUserId === 0) setMessage('Game Over. Tie.');
            else if(winnerUserId == -1) setMessage('Opponent left. Looking for a new opponent.');
            disableControls();
            endwait = true;
		}
		lastActionFeedId = i;
        if(endwait)
        {
            setTimeout(function(){parseFeedActions();}, 2500);   
            break;
        }
	}
}

function resetBoard()
{
	for(var i=1;i<10;i++)
	{
		$('#square'+i).removeClass('pickedx');
		$('#square'+i).removeClass('pickedo');
	}
}
function updateBoard()
{
	if(room) 
	{
        resetBoard();
		for(var i=1;i<10;i++)
		{
			if(room.game['square'+i] != '') $('#square'+i).addClass('picked' + room.game['square'+i].toLowerCase());
		}
	}
}

/*function updateRoom()
{
	var req = {};
	req.roomKey = room.roomKey;
	$.post(serverurl+"getRoom", { req: JSON.stringify(req) } , function(data) {
		if(data.status == 'success')
		{
			room = data.response.room;
			players[0] = room.players[0].userId;
			players[1] = room.players[1].userId;
			updateBoard();
			updateUsers();
		}
		else
		{
			log('ERROR: status != success on getUserFeed');
		}
	});
}*/

function updateUsers()
{
	for(var j=0;j<2;j++)
	{
		var req = {};
		req.userId = room.players[j].userId;
		$.post(serverurl+"getUser", { req: JSON.stringify(req) } , function(data) {
			if(data.status == 'success')
			{
				if(room.players[0].userId == data.response.user.gameUserId) 
				{ 
					$('#nameTag0').show();
					$('#nameTag0').html('X : ' + data.response.user.accountId + '<br>');
				}
				if(room.players[1].userId == data.response.user.gameUserId)
				{
					$('#nameTag1').show();
					$('#nameTag1').html('O : ' + data.response.user.accountId + '<br>');
				}
			}
			else
			{
				log('ERROR: status != success on updateUsers');
			}
		});
	}
}

function setMessage(message)
{
	$('#message').html('<h1>'+message+'</h1>');
}
function tick()
{
	setTimeout(tick,ticktimer);
	getUserFeed();
}

log('init js');
