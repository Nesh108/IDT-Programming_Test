var socket = io();

var nickname = chance.hashtag();

$('#send-msg-btn').click(function () {
  $('#message-box').submit();
});

// Message Box
$('#mess-box').submit(function() {
  var msg = $('#message-box').val();
  if(msg != ''){
    if(msg.indexOf('/') != 0){
      socket.emit('chat', {"user" : nickname, "msg" : msg});
      $('#messages').append($('<p>').html("<b>" + nickname + "</b>: " + msg));

    }
    else
    {
      // Commands
      // Set new nickname
      if(msg.indexOf("/name ") === 0)
      {
        $('#messages').append($('<p>').html("<i>" + nickname + " is now known as '" + msg.split(" ")[1] + "'.</i>"));
        socket.emit('nick_msg', {"user" : msg.split(" ")[1], "new_user" : nickname });
        nickname = msg.split(" ")[1];

      }
      // See your current nickname
      else if(msg.indexOf("/whoami") === 0)
        $('#messages').append($('<p>').html("<i>Your nickname is: " + nickname + ".</i>"));

      // Help command
      else if(msg.indexOf("/help") === 0)
        $('#messages').append($('<p>').html("<i>List of available commands: name <name_nickname> - change your username, whoami - get your current username, help - this message.</i>"));

      else
        $('#messages').append($('<p>').html("<i>Command not recognized.</i>"));
    }

    $('#message-box').val('');
    event.preventDefault();
  }
  return false;
});

// New message
socket.on('chat', function(chat) {
  $('#messages').append($('<p>').html("<b>" + chat.user + "</b>: " + chat.msg));
});

// User changed nickname
socket.on('nick_msg', function(chat) {
  $('#messages').append($('<p>').html("<i>" + chat.user + " is now known as '" + chat.new_user + "'.</i>"));
});

// User count
socket.on('users_connected', function(user_count) {
  console.log("got count");
  $('#count').text(user_count.users);
});

// Ask for the count of connected users (only after first load)
$( document ).ready(function() {
    socket.emit('connected_users');
});
