var game = require("../game/game");

function playTurn(request, response, query, postData) {
  response.writeHead(200, {"Content-Type": "text/json", "Access-Control-Allow-Origin": "*", "X-Frame-Options": "GOFORIT"});
  if(postData != null)
  {
    var req = JSON.parse(postData.req);
    var res = {};
    game.playTurn(req.userId, req.roomKey, req.turn);
    res.status = 'success';
    response.write(JSON.stringify(res));    
  }
  response.end();
}

exports.playTurn = playTurn;
