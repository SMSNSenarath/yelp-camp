const express =  require("express");
const app =  express();
const path = require("path");
const methodOverride = require("method-override")
const mongoose = require("mongoose");
const ejsMate =  require("ejs-mate");
const ExpressError =  require("./utilities/ExpressError");
const session =  require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratergy = require("passport-local");
const User = require("./models/user");

//Importing Routes 
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); //static assets
// app.use(express.static("public"));


const sessionConfig = {
    secret : "thisisthesecret",
    resave : false,
    saveUninitialized : true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

mongoose.connect("mongodb+srv://yelpcamp:1234@cluster0.tsd1kcy.mongodb.net/?retryWrites=true&w=majority")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate())); //authenticate is a static function that added to the user model by passport

passport.serializeUser(User.serializeUser());//How do you store a user in a session
passport.deserializeUser(User.deserializeUser());

//Defining Middlewares
app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

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