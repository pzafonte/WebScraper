var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  link: {
    type: String,
    trim: true,
    required: true
  },
  excerpt: {
    type: String,
    trim: true,
    required: true
  },
  notes:
  [{
      type: Schema.Types.ObjectId,
      ref: "Note"
    }]
});

var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
