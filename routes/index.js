var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


 // GET users listing. 
   router.get("/", function (req, res, next) {
   res.json("Bienvenue sur la route principale INDEX");
 });

module.exports = router;




