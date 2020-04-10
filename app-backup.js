var http = require("http");
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var path = require('path');
var expressValidator = require('express-validator')
 
 // Set up handlebars templating
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs({defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts/'}));
app.set('view engine','handlebars');

 //Needed for forms to parse the fields that you have posted from forms
app.use(bodyParser.urlencoded({  extended: true }));

//Set up database connection
/**
 * Store database credentials in a separate config.js file
 * Load the file/module and its values
 */ 
var config = require('./config')
var connection = mysql.createConnection({
  host     : config.database.host, 
  user     : config.database.user, 
  password : config.database.password, 
  database : config.database.db 
}); 
connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected to the database ...');
});

/**
 * Express Validator Middleware for Form Validation
 */ 

app.use(expressValidator())

// homepage route
app.get('/', function (req, res) {
	var errorMsg = "";
   connection.query('select * from employees', function (error, rows, fields) {
	if (error) {
		   console.log("Error on / "  + error); //Better to write to error log
		   errorMsg = "Apologies, we were unable to retrieve employee details. If this problem persists please contact Admin.";
	}
	res.render('employees/list', {
		  errorMsg: errorMsg,
		  employees: rows});
	});
});
app.get('/employees/list', function (req, res) {
	var errorMsg = "";
   connection.query('select * from employees', function (error, rows, fields) {
	if (error) {
		   console.log("Error on / "  + error); //Better to write to error log
		   errorMsg = "Apologies, we were unable to retrieve employee details. If this problem persists please contact Admin.";
	}
	res.render('employees/list', {
		  errorMsg: errorMsg,
		  employees: rows});
	});
});

// Add employee routes
app.get('/employees/add', function(req, res){
	var employee = {
            firstname: "",
            surname: ""  
    }
	res.render('employees/add', {
		employee: employee
	});
});
app.post('/employees/add', function(req, res){
	req.assert('firstname', 'Firstname is required').notEmpty();
	req.assert('surname', 'Surname is required').notEmpty() ;
	var errors = req.validationErrors();

	// get the values posted
	var employee = {
            firstname: req.sanitize('firstname').escape().trim(),
            surname: req.sanitize('surname').escape().trim()  
    }	
	if( !errors ) {   //No errors were found.     	 
		connection.query('INSERT INTO employees SET ?', employee, function(err, result){
			//if (err) throw err;
			if (err) {
					console.log("Error adding employee "  + err); //Better to write to error log 
					errorMsg = "Apologies, we were unable to add this employee to the database.  If this problem persists please contact an Admin.  <br/><a href='/'> Homepage </a>";
					res.render('/employees/add', { 
						errorMsg: errorMsg,
						firstname: employee.firstname,
						surname: employee.surname
					});
				}
				else{
					console.log("Message from MySQL Server : " 
				+ result.message);
			res.redirect(303, '/employees/thank-you');  // Later we will learn to use a flash message & redirect to employee list page
		
				}
			});  
		
	}
	else {   //Display errors eg firstname left blank
	
		var errorMsg = ''
		errors.forEach(function(error) {
			errorMsg += error.msg + '<br>'
		})			
        res.render('employees/add', { 
			errorMsg: errorMsg,
            firstname: employee.firstname,
            surname: employee.surname
        })
    }
});

// Later we will learn to use flash messages instead of a thankyou page.
app.get('/employees/thank-you', function(req, res){
	res.render('employees/thank-you');
});

// Update employee - display the form with existing data from the database
app.get('/employees/update/:id', function(req, res){
		var errorMsg = "";
		var id = req.sanitize('id').escape().trim();
			connection.query('select * from employees where id=?', [id], function (error, results, fields) {
				if (error) {
					console.log("Error on /update "  + error); //Better to write to error log 
					errorMsg = "Apologies, we were unable to retrieve employee details from the database.  If this problem persists please contact an Admin.  <br/><a href='/'> Homepage </a>";
					res.render('employees/update', { 
						errorMsg: errorMsg});
				}
				else
				{
					var numRows = results.length;
					if (numRows === 0){
						errorMsg = "There are no details in the database for employee id " +  [req.params.id] + ". Please return to the <a href='/'>homepage</a> and choose an employee.";
						res.render('employees/update', { 
						errorMsg: errorMsg});	
					}
					else{
					res.render('employees/update', { 
						errorMsg: errorMsg,
						employee: results[0]});	
					}						
				}
			});
				
});
app.post('/employees/update', function(req, res){
	req.assert('firstname', 'Firstname is required').notEmpty();
	req.assert('surname', 'Surname is required').notEmpty() ;
	var errors = req.validationErrors();
	var errorMsg = "";
	
	// get the values posted in the form
	var employee = {
            firstname: req.sanitize('firstname').escape().trim(),
            surname: req.sanitize('surname').escape().trim(),
			id: req.sanitize('id').escape().trim()
        }
	
	if( !errors ) {   //No errors were found
	var sql = "UPDATE Employees SET firstname = '" + employee.firstname + "', surname= '" + employee.surname + "' WHERE id = " + employee.id; 
	//console.log(sql); // should write to log
	connection.query(sql, function (err, result) {
		//if (err) throw err;
		if (err) {
					console.log("Error on updating employee "  + err); //Better to write to error log 
					errorMsg = "Apologies, we were unable to update employee details.  If this problem persists please contact an Admin.  <br/><a href='/'> Homepage </a>";
					res.render('employees/update', { 
						errorMsg: errorMsg,
						employee: employee
						});
				}
		else{
			console.log("Message from MySQL Server : " 
				+ result.message);  // should write to log
			res.redirect(303, '/employees/thank-you');
		}
	});  
	
			}
else {   //Display errors 
			errors.forEach(function(error) {
				errorMsg += error.msg + '<br />'
			});			
			res.render('employees/update', { 
				errorMsg: errorMsg,
				employee: employee
			});
		}
});
app.get('/employees/thank-you', function(req, res){
res.render('/employees/thank-you');
});

// Employee details page
app.get('/employees/show/:id', function (req, res) {
	 var errorMsg = "";
   // Make the id safe
   var id =  req.sanitize('id').escape().trim();
	   connection.query('select * from employees where id=?', id , function (error, results, fields) {
	  if (error) {
		   console.log("Error on / "  + error); //Better to write to error log
		   errorMsg = "Apologies, we were unable to retrieve employee details. Return to the <a href='/'> homepage </a> and choose an employee. ";
	   }
	   else
	   {
			var numRows = results.length;
			if (numRows === 0){
				errorMsg = "There are no details in the database for employee id " +  [req.params.id] + ". please return to the <a href='/'>homepage</a> and choose an employee.";
			}
	   }
	  res.render('employees/show', { 
		errorMsg: errorMsg,
		employee: results[0]});
	});
});
 
 // Routes for delete
 app.get('/employees/delete/:id', function(req, res){
		var errorMsg = "";
		var id = req.sanitize('id').escape().trim();
			connection.query('select * from employees where id=?', [id], function (error, results, fields) {
				if (error) {
					console.log("Error getting employee to delete "  + error); //Better to write to error log 
					errorMsg = "Apologies, we were unable to retrieve employee details.  If this problem persists please contact an Admin.  <br/><a href='/'> Homepage </a>";
					res.render('/employees/delete', { 
						errorMsg: errorMsg});
				}
				else
				{
					var numRows = results.length;
					if (numRows === 0){
						errorMsg = "There are no details in the database for employee id " +  [req.params.id] + ". Please return to the <a href='/'>homepage</a> and choose an employee.";
						res.render('/employees/delete', { 
						errorMsg: errorMsg});	
					}
					else{
						res.render('employees/delete', { 
							errorMsg: errorMsg,
							employee: results[0]});							
					}
				}
			});
				
});
app.post('/employees/delete', function (req, res) {
	var id = req.sanitize('id').escape().trim();
    connection.query('DELETE FROM employees WHERE id=?', [id], function (error, results, fields) {
	 if (error) {
			console.log("Error delete employee "  + error); //Better to write to error log 
					errorMsg = "Apologies, we were unable to delete the employee.  If this problem persists please contact an Admin.  <br/><a href='/'> Homepage </a>";
					res.render('employees/delete', { 
						errorMsg: errorMsg});
	}
	else
	{
		res.redirect(303, '/employees/thank-you');
	}
	});
}); 

app.listen(3000, function () {
  console.log("Server listening on port 3000"); 
});