const express =  require("express");
const router = express.Router({mergeParams: true}); //since express router likes to keep params seperated, we are going to merge them
const Review = require("../models/review");
const Campground = require("../models/campground")
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");
//Importing Middlewares
const {validatedReview, isLoggedIn, isReviewAuthor} = require("../middleware");



//Add a Review
router.post("/", isLoggedIn, validatedReview, catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review =  new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Delete a Review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(async(req, res, next)=>{
    const {id, reviewId} = req.params;
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //since we have a reference to the campground from reviews
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;