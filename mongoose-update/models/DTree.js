/**
 * decisionTree数据模型精简版
 * 通过Demo的DTree-structure.json得出的结构
 */
var mongoose = require('mongoose');

//CHILDREN SCHEMA
var childrenSchema = new mongoose.Schema({
		id: { type: Number },
		name: { type: String },
		type: { type: String },
		change: { type: String }, //此两项的类型未知
		markov_info: { type: String },
		variable: [{
			pid: { type: Number },
			name: { type: String },
			formula: { type: String },
			category: { type: String },
			display: { type: Boolean },
			description: { type: String }
		}],
		tracker: { type: String },
		payoff: { type: String },
		compiled_prob: { type: String },
		compiled_variable: { type: String },
		compiled_tracker: { type: String },
		compiled_payoff: { type: String },
		parsed_prob: { type: String },
		parsed_variable: { type: String },
		parsed_tracker: { type: String },
		parsed_payoff: { type: String },//此处需要能够插入chilldren .structure.children
		//children: [sechildrenSchema]
		//_children: [childrenSchema]
});

    
//DTREE SCHEMA
var dtreeSchema = new mongoose.Schema({
	name: { type: String },
	config: {
		name: { type: String },
		description: { type: String },
		last_saved: { type: Date, default: Date.now}, //how to set a Date
		security_level: { type: String },
		layout_style: { type: String },
		depth: { type: Number },
		layer_width: [{
			width: {type: Number}
		}], //Number
		show_title: { type: Boolean },
		show_info: { type: Boolean },
		show_default_info: { type: Boolean },
		show_compiled_info: { type: Boolean },
		show_parsed_info: { type: Boolean },
		show_variable: { type: Boolean },
		show_tracker: { type: Boolean },
		show_payoff: { type: Boolean }
	},
	parameter:  [{
		pid: { type: Number },
		name: { type: String },
		formula: { type: String },
		category: { type: String },
		display: { type: Boolean },
		description: { type: String }
	}],
	structure: [childrenSchema]
});



// dtreeSchema.statics.save = function(obj, callback) {
//   this.save(function(err){
//     callback(err);
//   });
// };

dtreeSchema.statics.findByName = function(name, callback){
	this.findOne({name: name}, function(err, obj){
		callback(err, obj);
	});
};

// Build the User model
mongoose.model( 'DTree', dtreeSchema );
mongoose.model( 'Children', childrenSchema );
