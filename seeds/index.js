const express =  require("express");
const app =  express();
const path = require("path");
const mongoose = require("mongoose");
const Campground =  require("../models/campground");
const cities = require("./cities");
const {descriptors, places} = require("./seedHelpers");

app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));

mongoose.connect("mongodb+srv://yelpcamp:1234@cluster0.tsd1kcy.mongodb.net/?retryWrites=true&w=majority")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const helpersSample = array => array[Math.floor(Math.random() * array.length)]; //creating an array function to call descriptors and places

const seedDB = async()=> {
    await Campground.deleteMany({});
    for(let i =0; i<50; i++){
     const random1000 = Math.floor(Math.random()* 1000);
     const camp =  new Campground({
        location: `${cities[random1000].city}, ${cities[random1000].province}`,
        title: `${helpersSample(descriptors)} ${helpersSample(places)}`
     }) 
     await camp.save();
    } 
}

seedDB().then(()=>{
    mongoose.connection.close(); //closing the db connection
})