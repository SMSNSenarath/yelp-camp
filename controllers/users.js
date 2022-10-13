const User = require("../models/user");
const Campground = require("../models/campground");
const Review = require ("../models/review");

//Serving the Register Form
module.exports.renderRegisterForm = (req, res)=>{
    res.render("users/register");
}

//Creating a User
module.exports.createUser = async (req, res)=>{ //because this takes time
    try{
     const {email, username, password} = req.body;
     const user = new User({email, username});
     const registeredUser = await User.register(user, password);
     req.login(registeredUser, err => {
         if(err) return next(err);
         req.flash("success", "Welcome to the Yelp Camp!");
         res.redirect("/campgrounds");
     })
    }catch(e){
     req.flash("error", e.message);
     res.redirect("/register");
    }
 }

 //Serving the Login form
 module.exports.renderLoginForm = (req, res)=>{
    res.render("users/login");
}

//Login a User
module.exports.loginUser = (req, res)=>{ //flash a error message by failureFlash
    req.flash("success", "Welcome Back!"); 
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;   
    res.redirect(redirectUrl);
}

//Logout a User
module.exports.logoutUser =  (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      req.flash("success", "Good Bye!");
      res.redirect("/campgrounds");
    });
  }