const express =  require("express");
const app =  express();
const path = require("path");
const methodOverride = require("method-override")
const mongoose = require("mongoose");
const ejsMate =  require("ejs-mate");
const ExpressError =  require("./utilities/ExpressError");
// const Campground =  require("./models/campground");
// const catchAsync =  require("./utilities/catchAsync");
// const {campgroundSchema, reviewSchema} = require("./schemas.js");
// const Review = require("./models/review")

//Importing Routes 
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");


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

//Defining Routers
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);


//Home Page
app.get("/",(req, res) => {
    res.render("home");
})

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