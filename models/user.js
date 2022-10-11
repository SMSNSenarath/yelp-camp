const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    email:{
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose); //it care of the user and its password to be unique etc

module.exports = mongoose.model("User", userSchema);