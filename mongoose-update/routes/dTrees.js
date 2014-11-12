var mongoose = require('mongoose');
var Dtree = mongoose.model('DTree');
var fs = require('fs');
var assert = require('assert');


mongoose.model('DTree');

exports.dTreeAdd = function(req, res){
	if(req.params.name){//update
		res.render('dTree', {
			title: req.params.name + ' Management',
			label: 'Edit: ' + req.params.name,
			dtree: req.params.name
		});
	}else{
		res.render('dTree', {
			title: 'Add Management',
			label: 'Add',
			dtree: false
		});
	}


};

exports.doDTreeAdd = function(req, res){
	console.log("Now");
	fs.readFile('./public/javascripts/import.json', 'utf8', function (err, data) {
		if(err) throw err;
		var json = JSON.parse(data);
		if(json._id){//update
			console.log("Now updating");
		}else{//insert
			Dtree.create(json, function(err, dtree, numAffected){
				if(err){
					res.send({'success':false,'err':err});
				}else{
					res.send({'success':true});
					console.log("dtree created and saved: " + dtree);
					res.redirect('/');			
				}
			});
		}	  
	});
};


exports.dTreeJSON = function(req, res){
	Dtree.findByName(req.params.name, function(err, obj){
		res.send(obj);
	});
};

//GET 添加structure结点 
exports.dtreeStructure = function(req, res){
	if(req.params.name){//update
		res.render('structure', {
			title: req.params.name + ' Management',
			dtree: req.params.name
		});
	}else{
		res.render('index', {
  			title: 'Index',
  			name: 'Type00',
			dtree: false
		});
	}
};

//params req.params.name
exports.createDtreeStructure = function(req, res){	
	//Find dtree by name
	Dtree.findByName(req.params.name, function(err, dtree){
		if(!err){
			//1.成功读取tree
			//读取新增结点
			var json;
			fs.readFile('./public/javascripts/update.json', 'utf8', function (err, data) {
				if(err)throw err;
				json = JSON.parse(data);
				console.log(json);
				//2.插入structure
				dtree.structure.push(json);
				//3.save to mongodb
				dtree.save(function(err, tree){
					if(err){
						console.log('Somthing wrong: ' + err);
					}else{
						console.log('Add a new node', tree);
						res.redirect('/dtree/json/Type00');				
					}
				});		  
			});
		}else{
			console.log('Somthing wrong: ' + err);
		}

	});
};

exports.dtreeChildren = function(req, res){
	if(req.params.name){//update
		res.render('children', {
			title: req.params.name + ' Management',
			dtree: req.params.name
		});
	}else{
		res.render('index', {
  			title: 'Index',
  			name: 'Type00',
			dtree: false
		});
	}	
};

//params req.params.name
exports.createDtreeChildren = function(req, res){
	//Find dtree by name
	Dtree.findByName(req.params.name, function(err, dtree){
		if(!err){
			//成功读取tree
			// 深度优先相关
			// var treeStructure = dtree.structure;
			// var treeConfig = dtree.config;
			// var treeParameter = dtree.parameter;
			//读取新增结点
			var json;
			fs.readFile('./public/javascripts/update.json', 'utf8', function (err, data) {
				if(err)throw err;
				json = JSON.parse(data);
				//structure parse
				//structure 为一个数组
				//structure[i] 为首个结点
				//structure[i].children 为其子节点 
				var newchildren = dtree.structure[0].children;
				//2.插入structure
				dtree.structure[0].children.push(json);
				console.log(dtree.structure[0].children);
				dtree.markModified(dtree.structure[0].children);
				//3.save to mongodb
				dtree.save(function(err, tree){
					if(err){
						console.log('Somthing wrong: ' + err);
					}else{
						console.log('Add a new node: '+ dtree.structure[0].children);
						res.redirect('/dtree/json/Type00');				
					}
				});		  
			});
		}else{
			console.log('Somthing wrong: ' + err);
		}

	});
};


//寻找插入位置
//
var findPos = function(dtree){
	//dtree.structure(){}
}
//寻找structure
var rootFirstTraversalStructure = function(structure){
	rootFirstTraversal(structure); //获得collection
}

var getChildren = function (d) {
	var d_children = d.children && d.children.length > 0 ? d.children : null;
	d_children = d._children && d._children.length > 0 ? d._children : null || d_children;
	return d_children;
}

var rootFirstTraversal = function (d) {
	if (!d) return;
	//todo
	console.log(d);
	var d_children = getChildren(d);
	if (d_children) {
		for (var i = 0; i < d_children.length; i++) {
			rootFirstTraversal(d_children[i]);
		}
	}
}

var readJson = function(){
	var url = '';
	var json;
	fs.readFile('./public/javascripts/update.json', 'utf8', function (err, data) {
	  if (err) throw err;
	  json = JSON.parse(data);
	  console.log(json);
	  return json;
	});
		
}