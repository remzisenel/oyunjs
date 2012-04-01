function error(request, response, query, postData) {
  response.writeHead(200, {"Content-Type": "text/html", "Access-Control-Allow-Origin": "*", "X-Frame-Options": "GOFORIT"});
  response.write("<!doctype html><h1> 404 - Not Found </h1></html>");
  response.end();
}
exports.error = error;