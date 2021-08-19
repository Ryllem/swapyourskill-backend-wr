let mongoose = require("mongoose");

let userSchema = mongoose.Schema({
    
    username: {
        type: String, 
        required: [true, "Tu as oublié de mettre un email "],
        minLength: [3, "3 caractères minimum"]
    },
    email: { 
        type: String,
        required: [true, "Tu as oublié de mettre ton email "],
        unique: [true, "Cet email est déjà utilisé"],
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Cette email n'est pas valide"],
      },
    password: {
        type: String,
        required: [true, "Tu as oublié de mettre ton mot de passe"],
        minLength: [4, "Mets un mot de passe plus long"],
    },
    avatar: { type: String, required: [true, "Tu as oublié de sélectionner un avatar "]},
    wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: "skills" }],
    token: String
})


let userModel = mongoose.model("users", userSchema);

module.exports = userModel;
