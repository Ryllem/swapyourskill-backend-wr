var express = require("express");
var router = express.Router();
let uid2 = require("uid2");
let bcrypt = require("bcrypt");

const userModel = require("../models/usermodel");
// const skillsModel = require('../Models/skill')

const cost = 10;


// GET users listing. 
router.get("/", function (req, res, next) {
  res.json("Bienvenue sur la route principale USERS");
});

/* SIGNUP */

router.post("/signup", async function (req, res, next) {
  //let token = await uid(32)
  console.log(req.body);
  const hash =
    req.body.password.length > 2
      ? bcrypt.hashSync(req.body.password, cost)
      : req.body.password;
  console.log("password:", req.body.password);
  console.log("hash:", hash);
  let errorMessage = {};
  try {
    let userToSave = new userModel({
      username: req.body.username,
      email: req.body.email.toLowerCase(),
      password: hash,
      token: uid2(32),
      avatar: req.body.avatar,
      wishList: [],
    });
    const userBdd = await userToSave.save();
    res.json({ status: true, message: userBdd });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      errorMessage = {
        email: `cette email '${error.keyValue.email}' est déjà utilisé`,
      };
    } else {
      errorMessage = Object.fromEntries(
        Object.entries(error.errors).map(([key, val]) => [key, val.message])
      );
    }
    res.json({ status: false, message: errorMessage });
  }
});

/* LOGIN */

router.post("/signin", async function (req, res, next) {
  const user = await userModel.findOne({ email: req.body.email.toLowerCase() }).populate({path:"wishList", populate: {path: 'teacher', select: { username: 1 } }});;
  // console.log("EMAIL: ", req.body.email)
  // console.log("PASSWORD: ", req.body.password)
  // console.log("USER ", user)
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      user.token = uid2(32);
      let userWithNewToken = await user.save();
      userWithNewToken.password = "";
      res.json({ status: true, message: userWithNewToken });
    } else {
      res.json({ status: false, message: {password: "Mot de passe incorrect", email: "" }});
    }
  } else { // Si aucun user trouvé (mail incorrect)
  res.json({ status: false, message: {password: "", email: "Aucun utilisateur trouvé" }});
  }
});

// LOAD USER 
router.post("/loaduser", async function (req, res, next) {

  console.log(req.body.token)
  console.log("ma req loaduser")
  if (req.body.token === undefined) res.json({ status: false, message: "Aucun token trouvé" });
  const user = await userModel.findOne({ token: req.body.token }).populate({path:"wishList", populate: {path: 'teacher', select: { username: 1 } }});
  if (user) {
      user.password = null;
      console.log('authentification réussi, user connecté: \u001b[1;32m ', user.username)
      res.json({ status: true, message: user });
    } else {
      console.log('authentification échec, user non connecté: \u001b[1;32m ')
      res.json({ status: false, message: "Aucun utilisateur trouvé" });
    }
});


/* LOG OUT */
router.post("/logout", async function (req, res, next) {
  console.log(req.body.token)
  console.log("ma req logout user")
  const removeToken = await userModel.updateOne(
    {token: req.body.token},
    {"$set": {"token": null}},
    { returnNewDocument: true }
    );
    console.log(removeToken.nModified)
  if (removeToken.nModified === 1) {
      res.json({ status: true, message: removeToken });
      
    } else {
      res.json({ status: false, message: "Aucune modification effectuée, l'utilisateur a toujours son token" });
    }
});

/* DASHBOARD */

router.post("/dashboard", async function (req, res, next) {

  console.log(req.query.token);
  const mySkill = await userModel.findOne({ email: req.body.email.toLowerCase() });
  

  /* /* Return
  true / false,
    rdv,
    mess, //( user)
    res.send("respond with a resource"); */
});




/* WISHLIST */

router.post("/addToWishlist", async function(req, res, next) {
  console.log("Arriveé sur route addToWishlist", req.body)
  if (req.body.token === undefined) res.json({ status: false, message: "Aucun token trouvé" });
  const user = await userModel.findOne({ token: req.body.token }, );
  console.log(user)
  const wishlist = await userModel.updateOne(
    { 
      _id: user._id
     }, 
     {
    $push: {wishList: req.body.skillId}
    });

  /* Return */
  res.json({ result: true, message: `Ajouté à la wishlist le skill ${req.body.skillId}` });
});

/* WISHLIST REMOVE */

router.post("/removeToWishlist", async function(req, res, next) {
  console.log("Arriveé sur route addToWishlist", req.body)
  if (req.body.token === undefined) res.json({ status: false, message: "Aucun token trouvé" });
  const user = await userModel.findOne({ token: req.body.token }, );
  console.log(user)
  const wishlist = await userModel.updateOne(
    { 
      _id: user._id
     }, 
     {
    $pull: {wishList: req.body.skillId}
    });

  /* Return */
  res.json({ result: true, message: `retiré de la wishlist le skill ${req.body.skillId}` });
});



module.exports = router;
