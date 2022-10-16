const Campground = require("../models/campground");
const {cloudinary} = require("../cloudinary")


//Loading Create Campground Form
module.exports.renderNewForm = (req, res)=> {
    res.render("campgrounds/new");
}

//Create a Campground
module.exports.createCampground = async (req, res)=> {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f=> ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground.images);
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground.id}`)
}

//Show All Campgrounds
module.exports.showAllCampgrounds = async (req, res)=> {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds})
}

//Show Individual Campground
module.exports.showOneCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
        {path: "reviews", 
            populate : {
                path : "author"
            }
        }).populate("author");
    // console.log(campground);
    if(!campground){
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", {campground});
}

//Loading Update a Campground Form
module.exports.renderUpdateForm = async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", {campground})
}

//Update a Campground
module.exports.updateCampground = async (req, res)=> {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f=> ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    req.flash("success", "Successfully updated the campground!");
    res.redirect(`/campgrounds/${campground.id}`)
}

//Delete a Campground
module.exports.deleteCampground = async (req, res)=> {
    const {id} = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the campground!");
    res.redirect('/campgrounds');
}