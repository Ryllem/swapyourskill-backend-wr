var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


 // GET users listing. 
   router.get("/", function (req, res, next) {
   res.json("Bienvenue sur la route principale INDEX");
 });

//  var userSchema = mongoose.Schema({
//   userName: String,
//   email: String,
//   password: String,
//   avatar: String,
//   bio: String,
//   token: String,
//   avis: String,
//   skillToShare: Array,
//   skillToLearn: Array,
//   skillings: Number,
// });

// var skillSchema = mongoose.Schema({
//   title: String,
//   category: String,
//   subcategory: String,
//   keywords: Array,
//   description: String,
//   location: String,
//   imgUrl: String,
//   counter: Number,
// });

// var avisSchema = mongoose.Schema({
//   comment: String,
//   user: String,
//   rate: Number,
// });

// var rdvSchema = mongoose.Schema({
//   teacherId: String,
//   learnerId: String,
//   timestamp: Number,
//   validate2: Boolean,
//   skillId: String,
// });

// var UserModel = mongoose.model('users', userSchema);
// var SkillModel = mongoose.model('skill', skillSchema);
// var AvisModel = mongoose.model('avis', avisSchema);
// var RdvModel = mongoose.model('rdv', rdvSchema);

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;

/* USERS */


