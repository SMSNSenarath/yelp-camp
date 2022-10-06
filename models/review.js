const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    body : String,
    rating : String
})


module.exports = mongoose.model("Review", reviewSchema);