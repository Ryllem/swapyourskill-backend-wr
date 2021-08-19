var express = require("express");
var router = express.Router();
let uid2 = require("uid2");
let bcrypt = require("bcrypt");

const userModel = require("../models/usermodel");

const cost = 10; //Bcrypt cost


// GET users listing. 
router.get("/", function (req, res, next) {
  res.json("Bienvenue sur la route principale USERS");
});

/* SIGNUP */
router.post("/signup", async function (req, res, next) {
  const hash =
    req.body.password.length >= 8
      ? bcrypt.hashSync(req.body.password, cost)
      : req.body.password;
      
  let errorMessage = {}; // Initialisation objet en cad d'erreur
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
    res.json({ status: true, message: userBdd }); // requete OK
  } catch (error) {
    if (error.code === 11000) { // error pour unique email
      errorMessage = {
        email: `cette email '${error.keyValue.email}' est déjà utilisé`,
      };
    } else {
      errorMessage = Object.fromEntries(
        Object.entries(error.errors).map(([key, val]) => [key, val.message]) // extraction de chaque erreur
      );
    }
    if (req.body.test === true) { // Only for test (password brypt)
      res.json({ status: false, message: errorMessage, hash: hash });
    } else {
    res.json({ status: false, message: errorMessage });
    }
  }
});

/* LOGIN */
router.post("/signin", async function (req, res, next) {
  const user = await userModel.findOne({ 
    email: req.body.email.toLowerCase() 
  }).populate({path:"wishList", populate: {path: 'teacher', select: { username: 1 } }});; // clé étrangère
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) { // Vérification du password chiffré avec Bcrypt
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
      // console.log('authentification réussi, user connecté: \u001b[1;32m ', user.username)
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

/* WISHLIST */

router.post("/addToWishlist", async function(req, res, next) {
  
  if (req.body.token === undefined) res.json({ status: false, message: "Aucun token trouvé" });
  const user = await userModel.findOne({ token: req.body.token }, );
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

  res.json({ result: true, message: `retiré de la wishlist le skill ${req.body.skillId}` });
});



module.exports = router;
