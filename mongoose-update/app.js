var express = require('express');

//顺序很重要，run mongoose
var db = require('./models/mongodb');
//第二步，注册Model
var Dtree = require('./models/Dtree');
//第三步，routes中的execute
var routes = require('./routes');
var users = require('./routes/users');
//next：自动加载model？？
var fs = require('fs');

var dTrees = require('./routes/dTrees');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var sessionStore = require("session-mongoose")(express);
var store = new sessionStore({
    url: "mongodb://localhost/session",
    interval: 120000 // expiration check worker run interval in millisec (default: 60000)
});

var ejs = require('ejs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
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


app.use(function(req, res, next){
  //res.locals.user = req.session.user;
  var err = req.session.error;
  delete req.session.error;
  res.locals.message = '';
  if (err) res.locals.message = '<div class="alert alert-error">' + err + '</div>';
  next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//访问路径
app.get('/', routes.index);
app.get('/users', users.list);

app.get('/dtree/add', dTrees.dTreeAdd);//增加
app.post('/dtree/add', dTrees.doDTreeAdd);//提交
app.get('/dtree/deserialize', dTrees.deserialize);//反序列化
app.get('/dtree/serialize', dTrees.doSerialize);//序列化
app.get('/dtree/pickdtree', dTrees.pickDtree);//选择需要存入数据库的内容

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
