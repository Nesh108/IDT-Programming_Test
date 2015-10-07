//////////////////////
// Web Server setup
//////////////////////

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');

var port_web = process.env.PORT || 8080;  // Post for web requests

var WEB_DIR = 'views';  // Folder for web pages

//////////////////////
// Configure MongoDB
//////////////////////

var config = require('./deploy/config');
var mongoose = require('mongoose');

var Message = require('./app/models/message');

// Connecting to MongoDB as well as quickly returning the last 20 messages
mongoose.connect('mongodb://' + config.db.user_name + ':' + config.db.password + '@' + config.db.URI);

/////////////////////////
// Configure body parser
/////////////////////////

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
/// Web Server
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

// Inspired by: https://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server

var server = http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname;

  console.log('Requested: ' + uri);

  // Allowing requests without HTML extensions
  if(uri.indexOf('.') == -1 && uri.indexOf('/', uri.length - 1) == -1)
    uri += '.html';

  var filename = path.join(process.cwd(), WEB_DIR + uri);
  var contentTypesByExtension = {
    '.html': "text/html",
    '.css': "text/css",
    '.js': "text/javascript"
  };

  fs.exists(filename, function(exists) {
    if(!exists) {

      // Load default 404 page
      fs.readFile('views/not_found.html', "binary", function(err, file) {
        // Error while loading the error page: great job devs!
        if(err){
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.write(err + "\n");
          response.end();
          return;
        }

        response.writeHead(404, {"Content-Type": "text/html"});
        response.write(file, "binary");
        response.end();
      });

      return;
    }

    if(fs.statSync(filename).isDirectory())
      filename += 'index.html';


    fs.readFile(filename, "binary", function(err, file) {
      if(err){
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if(contentType)
        headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
      return;
    });
  });
});

var io = require('socket.io')(server);  // Attaching SocketIO to HTTP server

server.listen(port_web);  // Starting web server

// Handling users and messages

var user_count = 0;

// On user connection
io.on('connection', function(socket) {

  user_count++;
  console.log("User connected");
  console.log("User count: " + user_count);

  Message.find({}).sort().limit(20).stream() // Retrieve the last 20 messages
  .on('data', function (chat) {
    socket.emit('chat', chat);
  })
  .on('error', function(err){
    console.log(err);
  })
  .on('end', function(){
  });

  // On user disconnection
  socket.on('disconnect', function() {
    user_count--;
    console.log("User disconnected");
    console.log("User count: " + user_count);

    socket.broadcast.emit('users_connected', {"users" : user_count});

  });

  socket.on('connected_users', function() {
    socket.broadcast.emit('users_connected', {"users" : user_count});
  });

  // On user message
  socket.on('chat', function(chat) {

    // Saving message
    var chat_msg = new Message();
    chat_msg.user = chat.user;
    chat_msg.msg = chat.msg;
    chat_msg.timestamp = new Date().toISOString();

    chat_msg.save(function(err) {
      if(err)
        console.log(err);

      socket.broadcast.emit('chat', chat);
    });
  });

  // On nickname update
  socket.on('nick_msg', function(chat) {
      socket.broadcast.emit('nick_msg', chat);
    });
});

// Logging
console.log('Web: Listening on port ' + port_web);
