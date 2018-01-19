/********************************************************************************* 
 * * WEB322 – Assignment 07
 * * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 * * of this assignment has been copied manually or electronically from any other source 
 * * (including 3rd party web sites) or distributed to other students. 
 * * * Name: _______Hyeyeon Kim_______________ Student ID: _______115376162______ Date: ___2018-01-05_________ 
 * * * Online (Heroku) Link: ________https://guarded-garden-25564.herokuapp.com/______________ 
 * * ********************************************************************************/
const dataServiceComments = require("./data-service-comments.js");
var dataServiceAuth = require("./data-service-auth.js");
var clientSessions = require("client-sessions");
var path = require("path");
var express = require("express");
var app = express();
var fs = require("fs");
var data_service = require("./data-service.js");
const exphbs = require('express-handlebars'); 
const bodyParser = require('body-parser');

app.use(clientSessions({
cookieName: "session", // this is the object name that will be added to 'req'
secret: "web322_A7", // this should be a long un-guessable string.
duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));
app.use(function(req, res, next) {
res.locals.session = req.session;
next();
});
function ensureLogin(req, res, next) {
if (!req.session.user) {
res.redirect("/login");
} else {
next();
}
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.engine(".hbs", exphbs({ 
  extname: ".hbs", 
  defaultLayout: 'layout', 
  helpers: { 
    equal: function (lvalue, rvalue, options) { 
      if (arguments.length < 3) 
        throw new Error("Handlebars Helper equal needs 2 parameters"); 
      if (lvalue != rvalue) { 
        return options.inverse(this); 
      } else { 
        return options.fn(this); 
      } 
    } 
  } 
})); 

app.set("view engine", ".hbs");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart(){
   console.log("Express http server listening on: " + HTTP_PORT);
};

app.get("/login", (req,res) => {
  res.render("login");
})
app.get("/register", (req,res) =>{
  res.render("register");
})
app.post("/register", (req,res)=>{
  dataServiceAuth.registerUser(req.body)
  .then( ()=>{
    res.render("register",{successMessage: "User created"})
  }).catch( (err)=>{
    res.render("register",{errorMessage: err, user: req.body.user} )
  });
});
app.post("/login", (req,res) =>{
  dataServiceAuth.checkUser(req.body)
  .then( ()=>{
    req.session.user = req.body.user;
    res.redirect("/employees");
  }).catch((err)=>{
    res.render("login", {errorMessage: err, user: req.body.user});
  });
});
app.get("/logout", (req,res) =>{
  req.session.reset();
  res.redirect('/');
});

app.post("/about/addComment", (req,res) => {
  console.log(req.body);
  dataServiceComments.addComment(req.body)
  .then( (data)=>{
    console.log(data);   
    res.redirect("/about");
  }).catch( (err) => {
    console.log(err);
    res.redirect("/about");
  });
});

app.post("/about/addReply", (req,res) => {
  console.log('/abcout/addreply',req.body);
  dataServiceComments.addReply(req.body)
  .then( (data) => {
    res.redirect("/about")
  }).catch( (err) => {
    console.log(err);
    res.redirect("/about");
  });
});





// setup another route to listen on /about
app.get("/", function(req,res){
  res.render("home");
});

app.get("/about", function(req,res){
  dataServiceComments.getAllComments()
  .then((dataFromPromise)=> {
    res.render("about", {data: dataFromPromise});
  }).catch((err)=>{
    console.log(err);
    res.render("about");
  });
});

app.get("/employees",ensureLogin, (req,res)=>{

  if(req.query.status){
    data_service.getEmployeesByStatus(req.query.status).then( (data)=>{
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err)=>{
      res.send("error: " + err);
    });  
  }else if(req.query.department){
    data_service.getEmployeesByDepartment(req.query.department).then( (data)=>{
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err)=>{
      res.send("error: " + err);
    })
  }else if(req.query.manager){
    data_service.getEmployeesByManager(req.query.manager).then( (data)=>{
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch((err)=>{
      res.send("error: " + err);
    })
  }else{ 
    data_service.getAllEmployees().then( (data)=>{
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch( (err)=>{
      res.send("error: " + err);
    })
  }
});
/*
app.get("/employee/:empNum", (req,res) => {
  data_service.getEmployeeByNum(req.params.empNum).then( (data)=>{
    res.render("employee", { data : data});
  }).catch( (err) => { 
    res.status(404).send("Employee Not Found");
  })
});
*/

app.get("/employee/:empNum",ensureLogin, (req, res) => {
  let viewData = {};
  data_service.getEmployeeByNum(req.params.empNum)
  .then( (data)=>{
    viewData.data = data;
  }).catch( ()=>{
    viewData.data = null;
  }).then(data_service.getDepartments)
  .then( (data) => {
    viewData.departments = data;
    for( let i=0; i<viewData.departments.length; i++) {
      if(viewData.departments[i].departmentId == viewData.data[0].department){
        viewData.departments[i].selected = true;
      }
    }
  }).catch( () => {
    viewData.departments = [];
  }).then( () => {
    if(viewData.data == null){
      res.status(404).send("Employee Not Found");
    }else{
      res.render("employee", {viewData: viewData});
    }
  });
});


app.get("/employees/add",ensureLogin, (req,res) => {
  data_service.getDepartments(req.body).then( (data) => {
    res.render("addEmployee", {departments : data})
  }).catch( (err) => {
    res.render("addEmployee", {departments : []});
  })
});


/*
app.get("/employees/add", (req,res) => {
  res.render("addEmployee");
});
*/


app.post("/employees/add",ensureLogin, (req, res) => {
  data_service.addEmployee(req.body).then( ()=>{
    console.log(req.body);
    res.redirect("/employees");
  }).catch( (err) => {
    console.log(err);
  })
});

app.post("/employee/update",ensureLogin, (req, res) => {
    data_service.updateEmployee(req.body).then( () => {
      console.log(req.body);
      res.redirect("/employees");
   }).catch((err) => {
      console.log(err);
   })
});


app.get("/managers",ensureLogin, (req,res) => {
    data_service.getEmployeesByManager().then( (data) => {
      res.render("employeeList", { data: data, title: "Employees(Managers)" });
    }).catch( (err) => {
      res.send("error: " + err);
    })
});

app.get("/departments",ensureLogin, (req,res)=>{
  data_service.getDepartments().then( (data) => {
    res.render("departmentList", { data: data, title:"Departments" });
  }).catch( (err) => {
    res.send("error: " + err);
  })
});

app.get("/departments/add",ensureLogin, (req,res) => {
  res.render("addDepartment");
});

app.post("/departments/add",ensureLogin, (req,res) => {
  data_service.addDepartment(req.body).then( () => {
    console.log(req.body);
    res.redirect("/departments");
  }).catch( (err) => {
    res.send("error: " + err);
  })
});

app.post("/department/update",ensureLogin, (req,res) => {
  data_service.updateDepartment(req.body).then( () => {
    console.log(req.body);
    res.redirect("/departments");
  }).catch( (err) => {
    res.send( "error: " + err );
  })
});

app.get("/department/:departmentId",ensureLogin, (req,res) => {
  data_service.getDepartmentById(req.params.departmentId).then( (data)=>{
    res.render( "department", { data : data } );
  }).catch( (err) => {
    res.status(404).send("Department Not Found : " + err );
  })
});

app.get("/employee/delete/:empNum",ensureLogin, (req,res) => {
  data_service.deleteEmployeeByNum(req.params.empNum).then( () => {
    res.redirect("/employees")
  }).catch( (err) => {
    res.status(500).send("Unable to remove Employee / Employee not found")
  })
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});




data_service.initialize()
.then(dataServiceComments.initialize())
.then(dataServiceAuth.initialize())
.then( ()=>{
  app.listen(HTTP_PORT, onHttpStart);
  console.log("data_service and dataServiceComments initialize");
}).catch( (err)=>{ 
  console.log("failed initialize" + err);
});



