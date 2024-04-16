const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
router.get("/", async (req,res)=>{
    const allListing= await Listing.find({});
    res.render("listings/index.ejs",{allListing});
});
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs")
})
//show
router.get("/:id", async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
});
router.get("/privacy",(req,res)=>{
    res.render("listings/privacy.ejs")
})
router.post("/", async (req, res,next) => {
    try{
        const newListing =  Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");  
    }
   catch(err){
    next(err);
   }
  });
//   Review Rout
router.post("/:id/reviews", async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    listing.reviews.push(newReview);
     await newReview.save();
     await listing.save();
    //  res.send("review has been saved")
     res.redirect(`/listings/${listing._id}`);
});
module.exports=router;