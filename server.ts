// ========= Imports ========= //
const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const moment = require("moment");
const ObjectID = mongodb.ObjectID;

// ========= Collections  ========= //
const monsters  = "monsters";
const spells    = "spells";
const players   = "players";
const campaigns = "campaigns";

// ========= API Setup ========= //
const app = express();
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool the app
let db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017", { useNewUrlParser: false }, (err, client) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");

  // Initialize the app.
  let server = app.listen(process.env.PORT || 8080, () => {
    let port = server.address().port;
    console.log("App now running on port", port);
  });
});

// Generic error handler used by all endpoints.
let handleError = (res, reason, message, code) => {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ "error": message });
}

// ========= Monsters ========= //
// Get ALL monsters
app.get("/api/" + monsters, function (req, res) {
  db.collection(monsters).find({}).toArray(function (err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get monsters", 500);
    } else {
      res.status(200).json(docs);
    }
  });
});

// Get monster matching an id
app.get("/api/" + monsters + "/:name", function (req, res) {
  db.collection(monsters).find({ name: { $regex: req.params.name, $options: 'i' } }).toArray(function (err, docs) {
      if(err) {
        handleError(res, err.message, "Failed to find monster with name " + req.params.name, 500);
      } else {
        res.status(200).json(docs);
      }
    });
});

// Post a monster
app.post("/api/" + monsters,  function (req, res) {
  const newEntry = req.body;
  if (!newEntry) {
    handleError(res, "Missing monster", "Must provide a monster to post.", 400);
  }
  db.collection(monsters).findOne({ name: newEntry.name }, (err, found) => {
    if(err) handleError(found, err.message, "Failed to find existing user while creating new monster.", 500);
    if(!found) {    
      db.collection(monsters).insertOne(newEntry, function (err, doc) {
        if (err) {
          handleError(res, err.message, "Failed to create new monster.", 403);
        } else {
          res.status(201).json(doc.ops[0]);
        }
      });
    } else {
      // Conflict, monster already with that name already exists
      res.status(409).json(newEntry.name);
    }
  });
});

app.delete("/api/" + monsters + "/:id", function (req, res) {
  db.collection(monsters).deleteOne({ "_id": ObjectID(req.params.id) }, function (err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete session with id " + req.params.id, 404);
    } else {
      // TODO: deleting an id that doesn't exist returns here
      res.status(200).json("Deleted session with id " + req.params.id);
    }
  });
});

// ========= Spells ========= //
// Get ALL spells
app.get("/api/" + spells, function (req, res) {
  db.collection(spells).find({}).toArray(function (err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get spells", 500);
    } else {
      res.status(200).json(docs);
    }
  });
});

// Get spell matching an id
app.get("/api/" + spells + "/:name", function (req, res) {
  db.collection(spells).find({ name: { $regex: req.params.name, $options: 'i' } }).toArray(function (err, docs) {
      if(err) {
        handleError(res, err.message, "Failed to find spell with name " + req.params.name, 500);
      } else {
        res.status(200).json(docs);
      }
    });
});

// Post a spell
app.post("/api/" + spells,  function (req, res) {
  const newEntry = req.body;
  if (!newEntry) {
    handleError(res, "Missing spell", "Must provide a spell to post.", 400);
  }
  db.collection(spells).findOne({ name: newEntry.name }, (err, found) => {
    if(err) handleError(found, err.message, "Failed to find existing user while creating new spell.", 500);
    if(!found) {    
      db.collection(spells).insertOne(newEntry, function (err, doc) {
        if (err) {
          handleError(res, err.message, "Failed to create new spell.", 500);
        } else {
          res.status(201).json(doc.ops[0]);
        }
      });
    } else {
      // Conflict, spell already with that name already exists
      res.status(409).json(newEntry.name);
    }
  });
});

app.delete("/api/" + spells + "/:id", function (req, res) {
  db.collection(spells).deleteOne({ "_id": ObjectID(req.params.id) }, function (err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete spell with id " + req.params.id, 500);
    } else {
      res.status(200).json("Deleted spell with id " + req.params.id);
    }
  });
});