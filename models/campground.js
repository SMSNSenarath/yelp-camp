const mongoose =  require("mongoose");
const Review = require("./review");
const Schema =  mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual("thumbnail").get(function(){
    return this.url.replace("/upload", "/upload/w_200");
})

const campgroundSchema =  new Schema({
    title : String,
    images : [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price : Number,
    description : String,
    location : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    reviews : [{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Review"
    }]
});

//Setting the middleware
//First name is the middleware name and the delete middleware only triggers by findByIdAndDelete name
campgroundSchema.post("findOneAndDelete", async function (doc){
    if (doc){ //if there is a document that deleted, delete its reviews
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model("Campground", campgroundSchema);