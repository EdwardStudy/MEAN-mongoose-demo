var mongoose = require('mongoose');
/* GET home page. */
exports.index = function(req, res){
  res.render('index', {
  	title: 'Decision Tree Lab',
  	name: 'Type00'
  });
};

// router.get('/', function(req, res){
// 	res.render('',);
// });

