const express =  require("express");
const app =  express();
const path = require("path");
const methodOverride = require("method-override")
const mongoose = require("mongoose");
const ejsMate =  require("ejs-mate");
const Campground =  require("./models/campground");
const ExpressError =  require("./utilities/ExpressError");
const catchAsync =  require("./utilities/catchAsync");
const {campgroundSchema, reviewSchema} = require("./schemas.js");
const Review = require("./models/review")



app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

mongoose.connect("mongodb+srv://yelpcamp:1234@cluster0.tsd1kcy.mongodb.net/?retryWrites=true&w=majority")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});


//Creating Middlewares

const validateCampground = (req, res, next) => {
    const {error}= campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(element => element.message).join(",")
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

const validatedReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(element => element.message).join(",")
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

//Home Page
app.get("/",(req, res) => {
    res.render("home");
})






//Loading Create Campground Form
app.get("/campgrounds/new", (req, res)=> {
    res.render("campgrounds/new");
})

//Create a Campground
app.post("/campgrounds", validateCampground, catchAsync(async (req, res)=> {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`)
}));







//Show All Campgrounds
app.get("/campgrounds", catchAsync(async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds})
})); 

//Show Individual Campground
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews");
    // console.log(campground);
    res.render("campgrounds/show", {campground});
}));








//Loading Update a Campground Form
app.get("/campgrounds/:id/edit", catchAsync(async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", {campground})
}));

//Update a Campground
app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res)=> {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground.id}`)
}));






//Delete a Campground
app.delete("/campgrounds/:id", catchAsync(async (req, res)=> {
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));


//Add a Review
app.post("/campgrounds/:id/reviews", validatedReview, catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review =  new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Delete a Review
app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async(req, res, next)=>{
    const {id, reviewId} = req.params;
    Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //since we have a reference to the campground from reviews
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


app.all("*", (req, res, next)=>{
    next(new ExpressError("Page Not Found!", 404))
})


//Error Handler
app.use((err, req, res, next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Something Went Wrong!"
    res.status(statusCode).render("error", {err});
})

app.listen(3000, () => {
    console.log("CONNECTED!!!");
})