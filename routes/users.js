const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utilities/catchAsync");

//Serving the Register Form
router.get("/register", (req, res)=>{
    res.render("users/register");
})


//Creating a User
router.post("/register", catchAsync(async (req, res)=>{ //because this takes time
   try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    req.flash("success", "Welcome to the Yelp Camp!");
    res.redirect("/campgrounds");
   }catch(e){
    req.flash("error", e.message);
    res.redirect("/register");
   }
}))

//Serving the Login form
router.get("/login", (req, res)=>{
    res.render("users/login");
})


//Login a User
router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res)=>{ //flash a error message by failureFlash
    req.flash("success", "Welcome Back!");    
    res.redirect("/campgrounds");
})

module.exports = router
