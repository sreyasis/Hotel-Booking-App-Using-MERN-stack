var createError = require('http-errors');
require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose =require('mongoose');

var indexRouter = require('./routes/index');
// for sessions
const session = require('express-session');
const MongoStore= require('connect-mongo')(session);
const flash = require('connect-flash');


const User = require('./models/user');
const passport= require('passport');
const compression = require('compression');
const helmet=require('helmet');

  

var app = express();
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https://res.cloudinary.com"],
      
    },
  })
);
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({
  secret: process.env.SECRET,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection})
}));

// middleware or passport

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use((req,res,next) =>{
  res.locals.user= req.user;
  res.locals.url=req.path
  res.locals.flash = req.flash()
  next();
})

//set up mong
mongoose.connect(process.env.DB, { useNewUrlParser: true }, { useUnifiedTopology: true }, { useMongoClient: true });
mongoose.Promise=global.Promise;
mongoose.connection.on('error',(error) => console.error(error.message));

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://letstraveladmin:Sreyas@cluster0.jtnwf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);



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
