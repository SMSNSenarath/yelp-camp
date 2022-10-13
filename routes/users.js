const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utilities/catchAsync");
const users = require("../controllers/users")


router.route("/register") 
    .get(users.renderRegisterForm) //Serving the Register Form
    .post(catchAsync(users.createUser)) //Creating a User


router.route("/login")
    .get(users.renderLoginForm) //Serving the Login form
    .post( passport.authenticate("local", {failureFlash: true, failureRedirect: "/login", keepSessionInfo: true}), users.loginUser) //Login a User


//Logout a User
router.get("/logout", users.logoutUser);

module.exports = router;
