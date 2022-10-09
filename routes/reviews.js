const express =  require("express");
const router = express.Router({mergeParams: true}); //since express router likes to keep params seperated, we are going to merge them
const Review = require("../models/review");
const Campground = require("../models/campground")
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");
const {reviewSchema} = require("../schemas.js");


//Creating Middlewares
const validatedReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(element => element.message).join(",")
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}


//Add a Review
router.post("/", validatedReview, catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review =  new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Delete a Review
router.delete("/:reviewId", catchAsync(async(req, res, next)=>{
    const {id, reviewId} = req.params;
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //since we have a reference to the campground from reviews
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;