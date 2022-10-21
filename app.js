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
const helmet = require("helmet");
const dbUrl = process.env.DB_URL;
const MongoDBStore = require('connect-mongo');

//Importing Routes 
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.connect(dbUrl)

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

// const store = new MongoDBStore({
//     url: dbUrl,
//     secret: "thisisthesecret",
//     touchAfter: 24 * 60 * 60 //This says to update the session data everyday, and not to update frequently
// })

// store.on("error", function (e){
//     console.log("Session store error!", e)
// })


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
    },
    store: MongoDBStore.create({mongoUrl: dbUrl, touchAfter: 24 * 60 * 60})
     //This says to update the session data everyday, and not to update frequently
}


app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false}));
// {contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false,}

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://kit-free.fontawesome.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drgl3d5b4/", 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`CONNECTED!, Serving on port ${port}!`);
})