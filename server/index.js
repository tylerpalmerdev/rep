// require modules
var express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    logger = require('morgan'),
    dotenv = require('dotenv').config();

// set up express & start app
var app = express();
var port = process.env.APP_PORT;

// set up middleware
var corsOptions = {
	origin: 'http://localhost' + port
};
app.use(logger('dev')); // logs any request made
app.use(cors(corsOptions));
app.use(express.static(__dirname + '/../public')); // serves up front end files
app.use(bodyParser.json()); // parses any body into json
app.use(bodyParser.urlencoded({extended: false}));

// set up & connect to mongolab db
var dbUri = process.env.PROD_DB_URI;
mongoose.connect(dbUri);
mongoose.connection.once('open', function() {
  console.log('MongoDB connected.');
});

// set up session store object to use in session and socket.io
var sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

// enable/config express session
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false
}));

// configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set up socketio
var http = require('http').Server(app),
    io = require('socket.io')(http),
    passportSocketIo = require('passport.socketio');

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
}));


function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');

  // If you use socket.io@1.X the callback looks different
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  console.log('successful connection to socket.io');

  if(error)
    accept(new Error(message));
}

io.sockets.on('connection', function(socket) {
  console.log('user connected!');
  var user = socket.request.user;
  console.log(user);
  if (user.role === 'voter') {
    console.log('Voter made it through!');
  } else if (user.role === 'rep') {
    console.log('Rep made it through!');
  }
});

// import endpoints file, initialized to express app
var routes = require('./routes')(app);

// start app listening
app.listen(port, function() {
  console.log('listening on port', port);
});
