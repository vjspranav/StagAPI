var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// For Mongo
const bodyParser = require("body-parser");
//const cors = require("cors");
const mongoose = require("mongoose");
const DB_NAME = "TestReport";
let mongouri = process.env.QOVERY_DATABASE_STAGOS_OFFICIAL_CONNECTION_URI;
//mongouri = mongouri.split("/admin")[0];
// Connect to moongose
// Connection to MongoDB
mongoose.connect(mongouri + "/" + DB_NAME, {
  useNewUrlParser: true,
});
const connection = mongoose.connection;
connection.once("open", function () {
  console.log(
    `MongoDB database connection to db ${DB_NAME} established successfully !`
  );
});

var indexRouter = require("./routes/index");
var downloadsRouter = require("./routes/downloads");
var updatesRouter = require("./routes/updates");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/downloads", downloadsRouter);
app.use("/updates", updatesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
