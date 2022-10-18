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

const price = Math.floor(Math.random()* 10000) + 1000;

const seedDB = async()=> {
    await Campground.deleteMany({});
    for(let i =0; i<50; i++){
     const random1000 = Math.floor(Math.random()* 1000);
     const camp =  new Campground({
        author: "63466a931a8c411e46cab660",
        location: `${cities[random1000].city}, ${cities[random1000].province}, Sri Lanka`,
        title: `${helpersSample(descriptors)} ${helpersSample(places)}`,
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Possimus, quaerat voluptatibus. Earum repudiandae placeat eius modi quam impedit cum incidunt consequuntur aliquam veniam ipsa, corporis, odio, vitae sunt vel",
        price,
        geometry:{
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
              ]
        },
        images: [
            {
              url: 'https://res.cloudinary.com/drgl3d5b4/image/upload/v1665817858/YelpCamp/hfycxnagdpn5z3ppurmj.jpg',
              filename: 'YelpCamp/hfycxnagdpn5z3ppurmj'
            },
            {
              url: 'https://res.cloudinary.com/drgl3d5b4/image/upload/v1665817863/YelpCamp/bkkp8keqxbdjlykyemtm.jpg',
              filename: 'YelpCamp/bkkp8keqxbdjlykyemtm'
            }
          ]
     }) 
     await camp.save();
    } 
}

seedDB().then(()=>{
    mongoose.connection.close(); //closing the db connection
})