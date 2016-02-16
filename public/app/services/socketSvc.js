repApp.service('socketSvc', function() {
  // var socket = io.connect('http://localhost:9000/');
  var socket = io.connect();

  this.getSocket = function() {
    return socket;
  };

  socket.on('connect', function() {
    console.log('connected to socket!');
  });
});
