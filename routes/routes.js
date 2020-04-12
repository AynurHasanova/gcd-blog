var db = require('../config/database.js');

module.exports = function(app, passport) {

   // default route 
    app.get("/", function(req,res){
        res.redirect("/blogs"); 
     });

   // list the last 10 blog 
    app.get("/blogs", function(req,res){
        var errorMsg = "";
        db.Blog.find({}).sort([['created', -1]]).limit(10).lean().exec(function(err,blogs){
        if(err){
            console.log("Error adding employee "  + err); //Better to write to error log
            errorMsg = "Apologies, we were unable to add this employee to the database.  If this problem persists please contact an Admin.  <br/><a href='/'> Homepage </a>";
        }  else {
            res.render('list', {
                errorMsg: errorMsg,
                blogs: blogs});
        }
        });
    });

    // create a new blog
    app.get("/blogs/new", isLoggedIn, function(req,res){
       res.render("new"); 
    });

    app.post('/blogs', isLoggedIn, function(req, res){
        req.assert('title', 'Title is required').notEmpty();
        req.assert('body', 'Blog content is required').notEmpty();
        var errors = req.validationErrors();

        // get the values posted
        var blog = {
                title: req.sanitize('title').escape().trim(),
                body: req.sanitize('body').escape().trim()  
        }	
        if( !errors ) {   //No errors were found.     	             
            db.Blog.create(blog,function(err,blog){
                    if(err){
                        res.render("new");
                    } else{
                        res.redirect("/blogs");
                    }
                });		
        }
        else {   //Display errors eg title left blank
            var errorMsg = ''
            errors.forEach(function(error) {
                errorMsg += error.msg + '<br>'
            })			
            res.render('new', { 
                errorMsg: errorMsg,
                title: blog.title,
                body: blog.body
            })
        }
    });

    // show a blog by id
    app.get("/blogs/:id", function(req, res){
        var errorMsg = "";
        // Make the id safe
        var id =  req.sanitize('id').escape().trim();
        db.Blog.findById(id).lean().exec(function(err,foundBlog){
            if(err){
                res.redirect("/blogs");
            } else{
                res.render("show",{blog: foundBlog});
            }
        }); 
    });

    // edit a blog by id
    app.get("/blogs/:id/edit", isLoggedIn, function(req,res){
        var errorMsg = "";
        var id = req.sanitize('id').escape().trim();
            
        db.Blog.findById(req.params.id).lean().exec(function(err,foundBlog){
            if(err){
                res.redirect("/blogs");
            } else{
                res.render("edit",{blog: foundBlog});
            }
        }); 
    });

    app.post("/blogs/:id", isLoggedIn, function(req,res){
        req.assert('title', 'Title is required').notEmpty();
        req.assert('body', 'Content is required').notEmpty() ;
        var errors = req.validationErrors();
        var errorMsg = "";

        // get the values posted
        var blog = {
            title: req.sanitize('title').escape().trim(),
            body: req.sanitize('body').escape().trim()  
        }	
        
        db.Blog.findByIdAndUpdate(req.params.id, blog,function(err,updatedblog){
        if(err){
            console.log("Error editing blog post "  + err);
            res.redirect("/blogs");
        } else{
            console.log("Edited blog post with "  + req.params.id);
            res.redirect("/blogs/"+req.params.id);
        }
      })
    });

    // delete a blog by id
    app.get("/blogs/:id/delete", isLoggedIn, function(req,res){
        var errorMsg = "";
        var id = req.sanitize('id').escape().trim();
        console.log("Deleting blog post with id "  + req.params.id);
        db.Blog.findByIdAndRemove(req.params.id,function(err){
            if(err){
                res.redirect("/blogs");
            } else{
                res.redirect("/blogs");
            }
        });
    });

    app.get("/login", (req, res) => {
        res.render("login")
    });

    app.post("/login", passport.authenticate("local-login", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
    );

    app.get('/signup',(req,res) => {
        res.render('signup');
    })

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/',
        failureRedirect : '/signup',
        failureFlash : true
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

}

function isLoggedIn(req, res, next){
    if (req.isAuthenticated())
     return next();
   
    res.redirect('/login');
}