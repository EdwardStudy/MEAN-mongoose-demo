var mongoose = require('mongoose');
var Project = mongoose.model('Project');

//GET project creation form
exports.create = function(req, res){
	res.render('project-form', {
		title: 'Create project',
		name: "",
		tasks: "",
		buttonText: 'Create!'
	});	
};

//POST new project creation form
exports.doCreate = function(req, res){
	Project.create({
		projectName: req.body.ProjectName,
		createdOn: Date.now(),
		createdBy: req.session.user._id,
		tasks: req.body.Tasks
	}, function(err, project){
		if(err){
			console.log(err);
			if(err.code===11000){
				res.redirect( '/project/new?exists=true' );
			}else{
				res.redirect('/?error=true');
			}
		}else{
			//Success
			console.log("Project created and saved: " + project);
			res.redirect('/user');
		}
	});
};

//GET project by UserID
exports.byUser = function(req, res){
	console.log("Getting user projects");
	if(req.params.userid){
		Project.findByUserID(req.params.userid, function(err, projects){
			if(!err){
				console.log(projects);
				res.json(projects);
			}else{
				console.log(err);
				res.json({"status": "error", "error": "Error finding projects"});
			}
		});
	}else{
		console.log("No user id supplied");
		res.json({"status": "error", "error": "No user id supplied"});		
	};
};

//GET project info
exports.displayInfo = function(req, res){
	console.log("Finding project _id: " + req.params.id);
	if(req.session.loggedIn !== true){
		res.redirect('/login');
	}else{
		if(req.params.id){
			Project.findById(req.params.id, function(err, project){
				if(err){
					console.log(err);
					res.redirect('/user?404=project');
				}else{
					console.log(project);
					res.render('project-page', {
						title: project.projectName,
						projectName: project.projectName,
						tasks: project.tasks,
						createdBy: project.createdBy,
						projectID: req.params.id
					});
				}
			});
		}else{
			res.redirect('/user');
		}
	}
};

//GET project edit form
exports.edit = function(req, res){
	if(req.session.loggedIn !== true){
		res.redirect('/login');
	}else{
		Project.findById(req.params.id, function(err, project){
			res.render('project-form', {
				title: 'Edit profiled',
				_id: req.params.id,
				name: project.name,
				tasks: project.tasks,
				buttonText: "Save"
			});			
		});

	}
};

//POST project edit form
exports.doEdit = function(req, res){
	//Find user by id held in the session
	if(req.params.id){
		Project.findById(req.params.id, function(err, project){
			if(err){
				console.console.log(err);
				res.redirect('/project?error=finding');
			}else{
				//Change the name and tasks to the values sent in the form
				project.name = req.body.ProjectName;
				project.tasks = req.body.Tasks;
				//Save the change
				project.save(function(err){
					if(!err){
						console.log('Project updated:' + req.body.FullName);
						res.redirect('/project/:id');
					}else{
						console.console.log(err);
						res.redirect('/project?error=finding');
					}
				});
			}
		});
	}//GET已经做判断
};