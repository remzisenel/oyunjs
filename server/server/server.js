var http = require("http");
var url = require("url");
var settings = require("../conf/conf.js");
var port = settings.conf.port;
var querystring = require("querystring");

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    var url_parts = url.parse(request.url);
    var pathname = url_parts.pathname;
    var query = url_parts.query;

    request.setEncoding("utf8");
    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      if (postData.length > 1e6) {
        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
        request.connection.destroy();
      }
    });

    request.addListener("end", function() {
      route(handle, pathname, request, response, querystring.parse(postData), querystring.parse(query));
    });

  }

  http.createServer(onRequest).listen(port);
  console.log('Server created and listening on port: ' + port);
}

exports.start = start;