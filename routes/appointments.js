var express = require("express");
var router = express.Router();

let mongoose = require("mongoose");
let appointmentModel = require("../models/appointmentmodel");
const userModel = require("../models/usermodel");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json("Bienvenue sur la route principale APPOINTMENTS");
});

/* CREATION DU RDV */
router.post("/createappointment", async function (req, res, next) {
  let { receiverId, senderId, skillId, appointmentDate } = req.body;
  let appointmentToSave = new appointmentModel({
    appointmentDate,
    senderId,
    receiverId,
    skillId,
    created_at: new Date(),
    done: false,
  });
  const appointmentBdd = await appointmentToSave.save();
  console.log("appointmnentBdd:", appointmentBdd);
  if (appointmentBdd) {
    res.json({ result: true, appointment: appointmentBdd });
  } else {
    res.json({
      result: false,
      message: "Echec lors de la création du rdv",
    });
  }
});

/** Recevoir la liste des rendez-vous */
router.post("/getappointment", async function (req, res, next) {
  const user = await userModel.findOne({ token: req.body.token });
  if (user !== null) {
  const appointmentBdd = await appointmentModel.find({
    $or: [{ receiverId: user._id }, { senderId: user._id }],
  })
  .populate("senderId", { username: 1 })
  .populate("receiverId", { username: 1 })
  .populate("skillId", { title: 1, imgUrl: 1, teacher: 1 });
  res.json({ result: true, message: appointmentBdd })
} else {
  res.json({ result: false, message: "not OK" })
}
});

module.exports = router;
