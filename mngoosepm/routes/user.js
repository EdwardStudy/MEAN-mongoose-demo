var mongoose = require('mongoose');
var User = mongoose.model('User');

//GET logged in usr page
exports.index = function(req, res){
	if(req.session.loggedIn === true){
		res.render('user-page', {
			title: req.session.user.name,
			name: req.session.user.name,
			email: req.session.user.email,
			userID: req.session.user._id
		});
	}else{
		res.redirect('/login');
	}
};

//GET user creation form
exports.create = function(req, res){
	res.render('user-form', {
		title: 'Create user',
		name: "",
		email: "",
		buttonText: 'Join!'
	});
};

//POST new user creation form
exports.doCreate = function(req, res){
	User.create({
		name: req.body.FullName,
		email: req.body.Email,
		modifiedOn: Date.now(),
		lastLogin: Date.now()
	}, function(err, user){
		if(err){
			console.log(err);
			if(err.code===11000){
				res.redirect( '/user/new?exists=true' );
			}else{
				res.redirect('/?error=true');
			}
		}else{
			//Success
			console.log("User created and saved: " + user);
			req.session.user = {"name": user.name, "email": user.email, "_id": user._id};
			req.session.loggedIn = true;
			res.redirect('/user');
		}
	});
};

//GET login page
exports.login = function(req, res){
	res.render('login-form', {
		title: 'Log in',
		buttonText: 'Log in!'
	});
};

//POST login page
exports.doLogin = function(req, res){
	if(req.body.Email){//Check the Email exists
		User.findOne({'email': req.body.Email}, '_id name email', function(err, user){
			if(!err){//Check the error
				if(!user){//Check the user exist on database
					res.redirect('/login?404=user');
				}else{
					req.session.user = {
						"name": user.name,
						"email": user.email,
						"_id": user._id
					};
					req.session.loggedIn = true;
					console.log("Logged in user: " + user);
					console.log("Session = " + req.session.loggedIn);
					//tracking user login by a document 'lastLogin'
					User.update(
						{_id: user._id},
						{$set: {lastLogin: Date.now()}}).exec();
						//function(err, numberAffected, raw){
						//	console.log('Test1 session ' + req.session.loggedIn);
						//	//Use $set 'lastLogin' to add db
						//	//First add, second change
						//	if(!err){
                        //
						//		res.redirect('/user');
						//	}else{
						//		console.log("Something wrong: " + err );
						//	}
                        //
						//}
					res.redirect('/user');
					console.log('Test2 session ' + req.session.loggedIn);
					//res.redirect('/user');
				}
			}else{
				console.log("Something wrong: " + err );
				res.redirect('/login?404=error');
			}			
		});
	}else{
		res.redirect('/login?404=error');
	}
};

//GET user edit form
exports.edit = function(req, res){
	if(req.session.loggedIn !== true){
		res.redirect('/login');
	}else{
		res.render('user-form', {
			title: 'Edit profiled',
			_id: req.session.user._id,
			name: req.session.user.name,
			email: req.session.user.email,
			buttonText: "Save"
		});
	}
};

//POST user edit form
exports.doEdit = function(req, res){
	//Find user by id held in the session
	if(req.session.user._id){
		User.findById(req.session.user._id, function(err, user){
			if(err){
				console.console.log(err);
				res.redirect('/user?error=finding');
			}else{
				//Change the name and email to the values sent in the form
				user.name = req.body.FullName;
				user.email = req.body.Email;
				user.modifiedOn = Date.new();
				//Save the change
				user.save(function(err){
					if(!err){
						console.log('User updated:' + req.body.FullName);
						req.session.user.name = req.body.FullName;
						req.session.user.email = req.body.Email;
						res.redirect('/user');
					}else{
						console.console.log(err);
						res.redirect('/user?error=finding');
					}
				});
			}
		});
	}//GET已经做判断
};