const Campground = require("../models/campground");
const Review = require("../models/review");

//Add a Review
module.exports.addReview = async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review =  new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
}

//Delete a Review
module.exports.deleteReview = async(req, res, next)=>{
    const {id, reviewId} = req.params;
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //since we have a reference to the campground from reviews
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/campgrounds/${id}`);
}