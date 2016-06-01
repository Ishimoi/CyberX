var http = require('http');
var ejs = require('ejs');
var fs = require('fs');

http.createServer(function(req,res) {
  res.writeHead(200, {'Content-Type': 'text/html'});

  //since we are in a request handler function
  //we're using readFile instead of readFileSync
  fs.readFile('index.html', 'utf-8', function(err, content) {
    if (err) {
      res.end('error occurred');
      return;
    }
    var temp = 'some temp';  //here you assign temp variable with needed value

    var renderedHtml = ejs.render(content, {temp: temp});  //get redered HTML code
    res.end(renderedHtml);
  });
}).listen(8888);
