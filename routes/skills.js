var express = require("express");
var router = express.Router();
let skillModel = require("../models/skill");
const userModel = require("../models/usermodel");

var fs = require("fs");
var uniqid = require("uniqid");

var cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "swap-your-skills",
  api_key: "576278358168666",
  api_secret: "qsHih4ecoREHgSi0o-nAWgQGUhQ",
});

/*SKILLS AFFICHEES AU DEPART*/

/* router.get("/ok", async function (req, res, next) {
  
  
  res.json("John")
}); */

router.get("/searchskills", async function (req, res, next) {
  
   try {
    let topSkills = await skillModel.aggregate([{ $sample: { size: 12 } }])
    
    let mySample = topSkills.map(id => id._id)
    // console.log('reqToSend2:', mySample)

    let reqToSend = await skillModel
      .find({_id: mySample})
      .populate("teacher", { username: 1 })
    
    res.json(reqToSend);
  } catch (error) {
    console.log(error);
  }
 // res.json({status: "ok"})
});



/* SKILLSSEARCH MAIN PAGE */
router.post("/searchskills", async function (req, res, next) {
  let response;
  if (req.body.cat) {
    console.log("cat asking from front");
    response = await skillModel
      .find({
        category: req.body.cat,
      })
      .populate("teacher");
  }
  if (req.body.subCat && req.body.citySelected) {
    response = await skillModel
      .find({
        subcategory: req.body.subCat,
        location: req.body.citySelected,
      })
      .populate("teacher");
  }
  if (req.body.subCat && !req.body.citySelected) {
    response = await skillModel
      .find({
        subcategory: req.body.subCat,
      })
      .populate("teacher");
  }
  if (!req.body.subCat && req.body.citySelected) {
    response = await skillModel
      .find({
        location: req.body.citySelected,
      })
      .populate("teacher");
  }

  res.json({ searchedSkills: response });
});

/* Users skills à afficher dans le profil public */
router.post("/searchUserskills", async function (req, res, next) {
  response = await skillModel.find({
    teacher: req.body.userId,
  });
  // console.log('response:', response)
  res.json(response);
});

/* Nouvelle annonce */
router.post("/addskill", async function (req, res, next) {
  //const user = await userModel.findOne({ token: req.body. });
  var pictureName = "./tmp/" + uniqid() + ".jpg";
  var resultCopy = await req.files.imageFromFront.mv(pictureName);

  var resultCloudinary = await cloudinary.uploader.upload(pictureName);
  resultCloudinary ? fs.unlinkSync(pictureName) : null;

  let newSkill = new skillModel({
    title: req.body.title,
    category: req.body.category,
    subcategory: req.body.subcategory,
    description: req.body.description,
    location: req.body.location,
    imgUrl: resultCloudinary.secure_url,
    counter: 0,
    teacher: req.body.teacherId,
    learner: [],
  });

  let skillSaved = await newSkill.save();

  res.json(skillSaved);
});

// Recherche mes skills pour ecran dashboard (Willem)
router.post("/myskills", async function (req, res, next) {
  console.log("Arrivée sur la route myskills");
  console.log(req.body.token);
  const user = await userModel.findOne({ token: req.body.token });
  // console.log(user._id);
  if (user) {
  const mySkills = await skillModel
    .find({ $or: [{ teacher: user._id }, { learner: user._id }] })
    .populate("teacher", { username: 1 });

  res.json({ result: true, message: mySkills });
  } else { res.json({ result: false, message: "Aucun user trouvé" }); }
});


module.exports = router;
