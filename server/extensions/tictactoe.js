var maxPlayers = 2;
function initialState()
{
    var init = {
        "square1" : '',
        "square2" : '',
        "square3" : '',
        "square4" : '',
        "square5" : '',
        "square6" : '',
        "square7" : '',
        "square8" : '',
        "square9" : ''
    }
    return init;
}

function playTurn(userId, gameRoom, turn)
{
    var ptr = {}
    ptr.result = 'failed';
    var playerIndex;
    for(var i = 0;i<gameRoom.players.length;i++)
    {
        if(gameRoom.players[i].userId == userId)
        {
            playerIndex = i;
        }
    }
    if(gameRoom.turnOwner == playerIndex && gameRoom.gameState == 'run' && actionValid(gameRoom.game,turn))
    {
        ptr.result = 'success';
        var mark = 'O';
        if(playerIndex % 2 === 0) mark = 'X';
        gameRoom.game[turn.action] = mark;
        var winner = checkGameState(gameRoom.game);
        if(winner === -1) ptr.state = 'run';
        else ptr.state = 'halt';
        
    }
    ptr.game = gameRoom.game;
    return ptr;

}

function actionValid(game,turn)
{
    if(game[turn.action] == '') return true;
    else return false;
}

function checkGameState(game)
{
    var winner = -1;
    var sq1 = game.square1;
    var sq2 = game.square2;
    var sq3 = game.square3;
    var sq4 = game.square4;
    var sq5 = game.square5;
    var sq6 = game.square6;
    var sq7 = game.square7;
    var sq8 = game.square8;
    var sq9 = game.square9;
    
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
        winner = 3;
    }
    
    return winner;
    
}

exports.initialState = initialState;
exports.maxPlayers = maxPlayers;
exports.playTurn = playTurn;