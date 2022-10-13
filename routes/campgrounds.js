const express =  require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utilities/catchAsync");
//Importing Middlewares
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware");
const campgrounds = require("../controllers/campgrounds");


//Loading Create Campground Form
router.get("/new",isLoggedIn, campgrounds.renderNewForm );

router.route("/")
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)) //Create a Campground
    .get(catchAsync(campgrounds.showAllCampgrounds)) //Show All Campgrounds

//Loading Update a Campground Form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderUpdateForm));

router.route("/:id")
    .get(catchAsync(campgrounds.showOneCampground)) //Show Individual Campground
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground)) //Update a Campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)) //Delete a Campground


module.exports = router;