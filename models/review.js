const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    body : String,
    rating : String,
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})


module.exports = mongoose.model("Review", reviewSchema);