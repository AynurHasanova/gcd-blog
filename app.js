var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');
var expressValidator = require('express-validator')


//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

 // Set up handlebars templating
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs({defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts/'}));
app.set('view engine','handlebars');


//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/test';
mongoose.connect(mongoDB, { useNewUrlParser: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log("Successfully connected to MongoDB!");
});


var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date,default:Date.now},
});

var Blog = mongoose.model("Blog",blogSchema);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator())
app.use(express.static(path.join(__dirname, 'public')));

var Blog = mongoose.model("Blog",blogSchema);
app.get("/",function(req,res){
   res.redirect("/blogs"); 
});

// homepage route

app.get("/blogs",function(req,res){
    var errorMsg = "";
    Blog.find({}).sort([['created', -1]]).limit(10).lean().exec(function(err,blogs){
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

app.get("/blogs/new",function(req,res){
   res.render("new"); 
});

app.post('/blogs', function(req, res){
	req.assert('title', 'Title is required').notEmpty();
   // req.assert('image', 'Image is required').notEmpty() ;
    req.assert('body', 'Blog content is required').notEmpty();
	var errors = req.validationErrors();

	// get the values posted
	var blog = {
            title: req.sanitize('title').escape().trim(),
            body: req.sanitize('body').escape().trim()  
    }	
	if( !errors ) {   //No errors were found.     	             
            Blog.create(blog,function(err,blog){
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

app.get("/blogs/:id",function(req, res){
   var errorMsg = "";
   // Make the id safe
   var id =  req.sanitize('id').escape().trim();
   Blog.findById(id).lean().exec(function(err,foundBlog){
      if(err){
          res.redirect("/blogs");
      } else{
          res.render("show",{blog: foundBlog});
      }
   }); 
});

app.get("/blogs/:id/edit",function(req,res){
   var errorMsg = "";
   var id = req.sanitize('id').escape().trim();
	
   Blog.findById(req.params.id).lean().exec(function(err,foundBlog){
       if(err){
           res.redirect("/blogs");
       } else{
           res.render("edit",{blog: foundBlog});
       }
   }); 
});

app.post("/blogs/:id", function(req,res){
    req.assert('title', 'Title is required').notEmpty();
	req.assert('body', 'Content is required').notEmpty() ;
	var errors = req.validationErrors();
    var errorMsg = "";

    // get the values posted
	var blog = {
        title: req.sanitize('title').escape().trim(),
        body: req.sanitize('body').escape().trim()  
    }	
    
    Blog.findByIdAndUpdate(req.params.id, blog,function(err,updatedblog){
       if(err){
           console.log("Error editing blog post "  + err);
           res.redirect("/blogs");
       } else{
           console.log("Edited blog post with "  + req.params.id);
           res.redirect("/blogs/"+req.params.id);
       }
   })
});


app.get("/blogs/:id/delete",function(req,res){
    var errorMsg = "";
    var id = req.sanitize('id').escape().trim();
    console.log("Deleting blog post with id "  + req.params.id);
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs");
        }
    });
 });


module.exports = app;
