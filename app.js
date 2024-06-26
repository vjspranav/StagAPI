const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// For Mongo
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// Model
const { loadModel } = require("./routes/helpers/util");

const DB_NAME = "StagOfficial";
let dbconfig = {};
try {
  dbconfig = require("./keys/prod.js");
} catch (ex) {
  dbconfig = {
    mongouri: process.env.ATLAS_URI,
  };
}

let mongouri = dbconfig.mongouri;
// Connect to moongose
// Connection to MongoDB
mongoose.connect(mongouri + "/" + DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", function () {
  console.log(
    `MongoDB database connection to db ${DB_NAME} established successfully !`
  );
});

loadModel().then(() => {
  console.log("Model loaded successfully");
});

const indexRouterOld = require("./routes/old/index");
const downloadsRouterOld = require("./routes/old/downloads");
const updatesRouterOld = require("./routes/old/updates");
const maintainersRouterOld = require("./routes/old/maintainers");

const indexRouter13 = require("./routes/13/index");
const downloadsRouter13 = require("./routes/13/downloads");
const updatesRouter13 = require("./routes/13/updates");
const maintainersRouter13 = require("./routes/13/maintainers");

const indexRouter = require("./routes/14/index");
const downloadsRouter = require("./routes/14/downloads");
const updatesRouter = require("./routes/14/updates");
const maintainersRouter = require("./routes/14/maintainers");
const reportRouter = require("./routes/14/report");

const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Setup /old/ routes
app.use("/old", indexRouterOld);
app.use("/old/downloads", downloadsRouterOld);
app.use("/old/updates", updatesRouterOld);
app.use("/old/maintainers", maintainersRouterOld);

// Setup /13/ routes
app.use("/13", indexRouter13);
app.use("/13/downloads", downloadsRouter13);
app.use("/13/updates", updatesRouter13);
app.use("/13/maintainers", maintainersRouter13);

// Setup /14/ routes
app.use("/14", indexRouter);
app.use("/14/downloads", downloadsRouter);
app.use("/14/updates", updatesRouter);
app.use("/14/maintainers", maintainersRouter);
app.use("/14/report", reportRouter);

// Point default route to /14/
app.use("/", indexRouter);
app.use("/downloads", downloadsRouter);
app.use("/updates", updatesRouter);
app.use("/maintainers", maintainersRouter);
app.use("/report", reportRouter);

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
