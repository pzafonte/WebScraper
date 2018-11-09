var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
const databaseUri = "mongodb://localhost/mongoscrapaer";
if (process.env.MONGODB_URI){
  mongoose.connect(process.env.MONGODB_URI)
}
else {
  mongoose.connect(databaseUri,
    {useNewUrlParser: true});
}

// Set handlebars
app.engine(
  ".hbs",
  exphbs({
    "defaultLayout": "main",
    "extname": ".hbs"
  }));

app.set("view engine", ".hbs");

// Routes

app.get("/", (req, res) => {
  // Get threads from the database
  db.Article.find({})
    .exec((err, articles) => {
      if (err) throw err;

      // Scrape if there aren't any articles yet
      if (articles.length === 0) {
        res.redirect("/scrape");

      } else {
        res.render("index", {
          articles
        });

      }
    });
});

//Route to get articles by scraping them from Ars Technica
app.get("/scrape", function (req, res) {
  axios
    .get("https://arstechnica.com/")
    .then(function (response) {
      var $ = cheerio.load(response.data);
      $("header").each(function (i, element) {
        var result = {};
        result.title = $(this)
          .find("h2")
          .children("a")
          .text();
        result.link = $(this)
          .find("h2")
          .children("a")
          .attr("href");
        result.excerpt = $(this)
          .find("p.excerpt")
          .text();
        if (result.title && result.link && result.excerpt) {
          db.Article.update({
              link: result.link
            }, result, {
              upsert: true,
              setDefaultsOnInsert: true
            })
            .then(function (dbArticle) {
              console.log(dbArticle);
            })
            .catch(function (err) {
              return res.json(err);
            });
        }
      });
      res.redirect("/");
    });

});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's notes
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({
      _id: req.params.id
    })
    .populate("notes")
    .then(function (dbArticle) {
      res.render("article", {
        "article": dbArticle
      });
      //res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for adding a note to an article
app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        $push: {
          notes: dbNote._id
        }
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//Route for deleting a note.
app.delete("/articles/:id/:noteid", function (req, res) {
  dbNote.remove({
    _id: req.params.dbNote._id
  })
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});