var mongoose = require('mongoose');
require("dotenv").config() // Chargement variables d'environnement

var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology : true
 }
 mongoose.connect(process.env.MONGO_PASS, 
    options,         
    function(err) {
     console.log(err || "MongoDb connecté");
    }
 );