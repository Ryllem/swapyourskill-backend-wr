let mongoose = require("mongoose");

let appointmentSchema = mongoose.Schema({
  created_at: Date,
  appointmentDate: Date,
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "ObjectId manquant receiver"],
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "ObjectId manquant sender"],
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "skills",
    required: [true, "ObjectId manquant skills"],
  },
  done: Boolean,
});

let appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;
