let mongoose = require("mongoose");

let messageSchema = mongoose.Schema({
  content: { type: String, required: [true, "Aucun contenu"] },
  created_at: Date,
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
  readed: Array,
  withAppointment: Boolean,
});

let messageModel = mongoose.model("messages", messageSchema);

module.exports = messageModel;
