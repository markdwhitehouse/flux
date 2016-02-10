// Include module dependencies
var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();

// Setup express.
app.set('port', process.env.PORT || 4000);
app.use(express.static('test'));

app.get('/fail', function(req, res) {
  res.status(500).send({"error":"Something broke!"});
});

app.get('/success', function(req, res) {
  res.status(200).send({
    "data1": "value1",
    "data2": "value2",
    "data3": "value3"
  });
});

app.post('/post', function(req, res) {
  res.status(200).send({
    "data1": "value1",
    "data2": "value2",
    "data3": "value3"
  });
});

app.post('/timeout', function(req, res) {
  setTimeout(function(){
    res.status(500).send({"error": "Took too damn long.",});
  }, 60000);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
