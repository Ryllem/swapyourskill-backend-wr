var express = require("express");
var router = express.Router();

let mongoose = require("mongoose");
let messageModel = require("../models/messagemodel");
const userModel = require("../models/usermodel");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json("Bienvenue sur la route principale MESSAGES");
});

/* CREATION DU MESSAGE */
router.post("/createmessage", async function (req, res, next) {
  let { receiverId, senderId, skillId, content } = req.body;

  let messageToSave = new messageModel({
    content,
    senderId,
    receiverId,
    skillId,
    created_at: new Date(),
    readed: [senderId],
    withAppointment: req.body.withAppointment,
  });
  const messageBdd = await messageToSave.save();
  console.log("messageBdd:", messageBdd);
  if (messageBdd) {
    res.json({ result: true, message: messageBdd });
  } else {
    res.json({
      result: false,
      message: "Echec lors de la création du message",
    });

  }
});

// Suppression de RDV sur message
router.post("/update", async function (req, res, next) {
  let updatedMess = await messageModel.updateOne(
    { _id: req.body._id },
    {
      withAppointment: false,
      content: `Je vous propose de se retrouver le ${req.body.content}.`,
    }
  );
  if (updatedMess) {
    res.json({ result: true, message: updatedMess });
  } else {
    res.json({
      result: false,
      message: "Echec lors de la modification du message",
    });
  }
});
// ECRAN DASHBORD MESSAGE
router.post("/readmessage", async function (req, res, next) {
  // message pour ecran dashboard
  const user = await userModel.findOne({ token: req.body.token });
  let aggregate = messageModel.aggregate();
  const ObjectId = mongoose.Types.ObjectId;
  aggregate.match({
    $or: [{ receiverId: ObjectId(user._id) }, { senderId: ObjectId(user._id) }],
  });
  
  aggregate.group({ _id: "$skillId", nbr: { $sum: 1 } });

  var data = await aggregate.exec(); // selectionne tous les message du user et les groupe par skillId
  console.log("data:", data);
  let reqToSend = [];
  let myMessageUnread = [];
  let totalUnreadMessage = 0;
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    let lastMessage = await messageModel // recupere le dernier message pour chaque conversation
      .find({
        $or: [{ receiverId: user._id }, { senderId: user._id }],
        skillId: element._id,
      })
      .sort({ created_at: -1 })
      .limit(1)
      .populate("senderId", { username: 1 })
      .populate("receiverId", { username: 1 })
      .populate("skillId", { title: 1, imgUrl: 1, teacher: 1 });

    reqToSend.push(lastMessage[0]);

    let messageUnread = await messageModel // Compte tous les messages sur chaque conversation
      .find({
        $or: [{ receiverId: user._id }, { senderId: user._id }],
        skillId: element._id,
        readed: { $ne: user._id.toString() },
      })
      .countDocuments()
      .sort({ created_at: 1 });
    myMessageUnread.push(messageUnread);
    totalUnreadMessage += messageUnread;
  }

  res.json({
    result: data.length === 0 ? false : true,
    message: reqToSend,
    myMessageUnread,
    totalUnreadMessage,
  });
});

/* RECUPERATION D'UNE CONVERSATION */
router.post("/conversation", async function (req, res, next) {
  let { userId, skillId, senderId, receiverId } = req.body;

  let conversation = await messageModel
    .find({
      '$or': [
        {receiverId: receiverId, senderId: senderId },
        {receiverId: senderId, senderId: receiverId }
      ],
      skillId: skillId
    }) 
    .sort({ created_at: 1 });
    
  res.json({ result: true, message: conversation });
});


/* PASSAGE DES MESSAGE EN LU */
router.post("/readed", async function (req, res, next) {
  let { userId, skillId } = req.body;

  let readed = await messageModel.updateMany(
    {
      $or: [{ receiverId: userId }, { senderId: userId }],
      skillId: skillId,
      readed: { $ne: userId.toString() },
    },
    {
      $push: { readed: userId.toString() },
    }
  );
  // console.log('readed 110:', readed)
  res.json({
    result: readed.nModified === 0 ? false : true,
    message: `message(s) passé(s) en status 'lu': ${readed.nModified}`,
  });
});

module.exports = router;
