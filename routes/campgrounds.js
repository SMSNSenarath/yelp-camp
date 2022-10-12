const express =  require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utilities/catchAsync");
//Importing Middlewares
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware");

//Loading Create Campground Form
router.get("/new",isLoggedIn, (req, res)=> {
    res.render("campgrounds/new");
})

//Create a Campground
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res)=> {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground.id}`)
}));

//Show All Campgrounds
router.get("/", catchAsync(async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds})
})); 

//Show Individual Campground
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
        {path: "reviews", 
            populate : {
                path : "author"
            }
        }).populate("author");
    // console.log(campground);
    if(!campground){
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", {campground});
}));


//Loading Update a Campground Form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", {campground})
}));

//Update a Campground
router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res)=> {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash("success", "Successfully updated the campground!");
    res.redirect(`/campgrounds/${campground.id}`)
}));

//Delete a Campground
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res)=> {
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the campground!");
    res.redirect('/campgrounds');
}));

module.exports = router;