var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');
var compression = require('compression');
var helmet = require('helmet');

var app = express();

app.use(helmet()); //protect application from web vulnarabilities by setting appropriate HTTP headers


//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
// var mongoDB = 'mongodb://172.17.0.3:27017/mydb'; //mongodb://<dbuser>:<dbpassword>@ds145184.mlab.com:45184/local_library_xmong
//node populatedb mongodb://congxmong:kamejoko11@ds145184.mlab.com:45184/local_library_xmong
// var mongoDB = process.env.MONGODB_URI || 'mongodb://congxmong:kamejoko11@ds145184.mlab.com:45184/local_library_xmong';
var mongoDB = 'mongodb://congxmong:kamejoko11@ds145184.mlab.com:45184/local_library_xmong';
mongoose.connect(mongoDB, { useNewUrlParser: true });
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(compression()); //Compress all routes

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
