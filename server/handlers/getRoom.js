var game = require("../game/game");

function getRoom(request, response, query, postData) {
  response.writeHead(200, {"Content-Type": "text/json", "Access-Control-Allow-Origin": "*", "X-Frame-Options": "GOFORIT"});
  if(postData != null)
  {
    var req = JSON.parse(postData.req);
    var res = {};
    res.status = 'success';
    res.response = {};
    res.response.room = game.getRoom(req.roomKey);
    response.write(JSON.stringify(res));    
  }
  response.end();
}

exports.getRoom = getRoom;
