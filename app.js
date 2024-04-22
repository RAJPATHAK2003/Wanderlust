const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const port=8000;
const MONGO_URL="mongodb://127.0.0.1:27017/wnder";
const ejsMate=require("ejs-mate");
const Review=require("./models/review.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const {isLoggedIn}=require("./middleware.js");
// const ExpressError = require('express-error');
// const listings=require(".routes/listing.js");
main().then(()=>{
    console.log("connectedm to database");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
// app.get("/test", async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"home",
//         description:"sdf",
//         price:234,
//         location:"india",
//         country:"india"
//     });
//     await sampleListing.save();
//     console.log("sample save");
//     res.send("test successful");
// });
const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now()+ 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})
// app.get("/demouser", async (req,res)=>{
//     let fakeUser=new User({
//         email:"rp123456@gmail.com",
//         username:"rp1234"
//     });
//   let registeredUser=await  User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// })


// app.get("/LOGINE",(req,res)=>{
//     res.render("listings/LOGIN.ejs");
// })
app.get("/listings", async (req,res)=>{
    const allListing= await Listing.find({});
    res.render("listings/index.ejs",{allListing});
});
app.get("/listings/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs")
})
//show
app.get("/listings/:id", async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
});
app.get("/privacy",(req,res)=>{
    res.render("listings/privacy.ejs")
})
app.post("/listings", async (req, res,next) => {
    try{
        const newListing =  Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New listing has been created");
    res.redirect("/listings");  
    }
   catch(err){
    next(err);
   }
  });
//   Review Rout
app.post("/listings/:id/reviews", async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    listing.reviews.push(newReview);
     await newReview.save();
     await listing.save();
    //  res.send("review has been saved")
    req.flash("success","new listing has been created");
     res.redirect(`/listings/${listing._id}`);
});
//ye signup ke liye hai
app.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})
app.post("/signup",async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        const newUser=new User({email,username,password});
       const registeredUser= await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            else{
                req.flash("success","Welcome to wonderlust");
                res.redirect("/listings")
            }
        });
      
    }
   catch(e){
    console.log(e);
    res.redirect("/login");
   }
})

//if user is already signup then he can be register
//HERE USER AUTHENTICATION START

app.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});
//passport.authenticate() will tell us that username and password is present in the database or not that checking part ye ek middleware hai
app.post("/login",passport.authenticate("local",{failureRedirect:"/signup",failureFlash:true}),async(req,res)=>{
        req.flash("success","WELCOME TO WANDERLUST");
        res.redirect("/listings");
})
// failureRedirect will direct you to a page if username and password already exist

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return  next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/listings");
    })
})

// app.use("/listings",listings);
app.use((err,req,res,next)=>{
    req.render("error.ejs");
})



app.listen(port,()=>{
    console.log("server is listening");
});
