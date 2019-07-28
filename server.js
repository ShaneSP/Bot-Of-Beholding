// ========= Imports ========= //
var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var moment = require("moment");
var ObjectID = mongodb.ObjectID;

// ========= Collections  ========= //


// ========= API Setup ========= //
var app = express();
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool the app
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});