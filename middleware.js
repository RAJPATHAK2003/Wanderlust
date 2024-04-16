module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("success","you must be loged in to create listing");
       return res.redirect("/login");
    }
    next();
}