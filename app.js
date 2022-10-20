if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

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
const mongoSanitize = require("express-mongo-sanitize");

//Importing Routes 
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect("mongodb+srv://yelpcamp:1234@cluster0.tsd1kcy.mongodb.net/?retryWrites=true&w=majority")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); //static assets
// app.use(express.static("public"));
//replacing unnecessary characters with _ to protect queries
app.use(mongoSanitize({
    replaceWith: '_'
}))

const sessionConfig = {
    name: "Camp",
    secret : "thisisthesecret",
    resave : false,
    saveUninitialized : true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate())); //authenticate is a static function that added to the user model by passport

passport.serializeUser(User.serializeUser());//How do you store a user in a session
passport.deserializeUser(User.deserializeUser());

//Defining Middlewares
app.use((req, res, next)=>{
    // console.log(req.session);
    res.locals.currentUser = req.user; 
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

//Defining Routers
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);



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