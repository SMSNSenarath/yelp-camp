const express =  require("express");
const router = express.Router({mergeParams: true}); //since express router likes to keep params seperated, we are going to merge them
const Review = require("../models/review");
const Campground = require("../models/campground")
const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");
//Importing Middlewares
const {validatedReview, isLoggedIn, isReviewAuthor} = require("../middleware");
const reviews = require("../controllers/reviews");


//Add a Review
router.post("/", isLoggedIn, validatedReview, catchAsync(reviews.addReview));

//Delete a Review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;