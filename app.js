const express =  require("express");
const app =  express();
const path = require("path");
const methodOverride = require("method-override")
const mongoose = require("mongoose");
const Campground =  require("./models/campground");

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




//Home Page
app.get("/",(req, res) => {
    res.render("home");
})






//Loading Create Campground Form
app.get("/campgrounds/new", (req, res)=> {
    res.render("campgrounds/new");
})

//Create a Campground
app.post("/campgrounds", async (req, res)=> {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`)
})







//Show All Campgrounds
app.get("/campgrounds", async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds})
});

//Show Individual Campground
app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", {campground});
})








//Loading Update a Campground Form
app.get("/campgrounds/:id/edit", async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", {campground})
})

//Update a Campground
app.put("/campgrounds/:id", async (req, res)=> {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground.id}`)
});






//Delete a Campground
app.delete("/campgrounds/:id", async (req, res)=> {
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})





app.listen(3000, () => {
    console.log("CONNECTED!!!");
})