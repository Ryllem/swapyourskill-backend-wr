var mongoose = require("mongoose");

var skillSchema = mongoose.Schema({
  title: String,
  category: String,
  subcategory: String,
  description: String,
  location: String,
  imgUrl: String,
  counter: Number,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  learner: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

var skillModel = mongoose.model("skills", skillSchema);

module.exports = skillModel;
