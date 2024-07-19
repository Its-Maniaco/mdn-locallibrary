const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Load environment variables from .env file
require('dotenv').config();

// These modules/files contain code for handling particular sets of related "routes" (URL paths).
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');
const wiki = require("./routes/wiki");
const compression = require("compression");
const helmet = require("helmet");

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const app = express();

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);

// view engine setup
// specify the folder where the templates will be stored
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// ejs doesnt support code 
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout'); // Default layout file

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression()); // Compress all routes
app.use(express.static(path.join(__dirname, 'public')));

// require route module

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wiki', wiki); 
app.use('/catalog', catalogRouter); // added to middleware chain

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
