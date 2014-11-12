/**
 * Module dependencies.
 */

var express = require('express');
var db = require('./model/db');
var routes = require('./routes');
var user = require('./routes/user');
var project = require('./routes/project');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var sessionStore = require("session-mongoose")(express);
var store = new sessionStore({
    url: "mongodb://localhost/session",
    interval: 120000 // expiration check worker run interval in millisec (default: 60000)
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('test'));
app.use(express.cookieSession({secret : 'test'}));
app.use(express.session({
	secret : 'test',
	store: store,
	cookie: { maxAge: 900000 }
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index); 
//USER ROUTES
app.get('/user', user.index); //user homepage or profile page
app.get('/user/new', user.create); //new user form
app.post('/user/new', user.doCreate);
app.get('/user/edit', user.edit); //edit current user details form
app.post('/user/edit', user.doEdit);
// app.get('/user/delete', user.delete); //delete user confirmation form
// app.post('/user/delete', user.doDelete);
app.get('/login', user.login); //Login page
app.post('/login', user.doLogin);
// app.get('/logout', user.index); //logout user action

//PROJECT ROUTES
app.get('/project/new', project.create); //new project form
app.post('/project/new', project.doCreate);
app.get('/project/:id', project.displayInfo); //project info display
app.get('/project/edit/:id', project.edit); //edit selected project form
app.post('/project/edit/:id', project.doEdit);
// app.get('/project/delete/:id', project.delete); //delete selected project form
// app.post('/project/delete/:id', project.doDelete);
app.get('/project/byuser/:userid', project.byUser); //Projects created by a user

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
