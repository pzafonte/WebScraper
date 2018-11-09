var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  body:{
    "type": String,
    "trim": true,
    "required": true
},
article: {
  type: Schema.Types.ObjectId,
  ref: "Article"
}
});

var Note = mongoose.model("Note", NoteSchema);
module.exports = Note;
