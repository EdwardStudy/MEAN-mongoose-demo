var mongoose = require('mongoose');

var db = 'mongodb://localhost/mongoosePM';

mongoose.connect(db);

//log messages to the console
mongoose.connection.on('connected', function(){
	console.log('Mongoose connected to ' + db);
});

mongoose.connection.on('error', function(err){
	console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function(){
	console.log('Mongoose disconnected');
});

process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
	});
});

//USER SCHEMA
var userSchema = new mongoose.Schema({
	name: String,
	email: {type: String, unique:true},
	createdOn: { type: Date, default: Date.now },
	modifiedOn: Date,
	lastLogin: Date
});

//PROJECT SCHEMA
var projectSchema = new mongoose.Schema({
	projectName: String,
	createdOn: Date,
	modifiedOn: { type: Date, default: Date.now },
	createdBy: String,
	tasks: String
});

projectSchema.statics.findByUserID = function (userid, callback) {
	this.find({createdBy: userid}, '_id projectName', {sort: 'modifiedOn'}, callback);
}

// projectSchema.statics.findByID = function (projectid, callback) {
// 	this.find({_id: projectid}, '_id projectName', {sort: 'modifiedOn'}, callback);
// }


// Build the User model
mongoose.model( 'User', userSchema );

// Build the Project model
mongoose.model( 'Project', projectSchema );


