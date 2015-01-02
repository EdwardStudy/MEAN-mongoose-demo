/**
 * decisionTree数据模型
 * 通过Demo的DTree-structure.json得出的结构
 * 14/12/4 获得最新结构 testjson/数据库结构说明.json
 * 由此获得schema
 * 14/12/9 完美适配 20141205_new_structure.json
 * 15/1/1 依据最新修改的20141205_new_structure.json 修改schema的键
 */
var mongoose = require('mongoose');


//DTREE SCHEMA
var dtreeSchema = new mongoose.Schema({
	config: { //config,用于存储决策树的一般配置信息
		name: { type: String }, //名称
		description: { type: String }, //对决策树的介绍，由用户输入
		//create_time: { type: Date, default: Date.now}, //首次创建的时间
		last_saved: { type: Date, default: Date.now}, //最近一次修改时间

		security_level: { type: String }, //安全等级，有私有，保护，完全公开三种模式
		layout_style: { type: String }, //决策树的主题样式
		layer_width: [ //决策树每一层的宽度(单位px)，这个数组的长度即树的深度
			{type: Number}
		],
		show_title: { type: Boolean }, //是否显示每一个节点的标题
		show_info: { type: Boolean }, //是否显示每一个节点的info（就是各种变量信息）
		show_param: { type: Boolean }, //是否显示每一个节点的变量
		show_tracker: { type: Boolean }, //是否显示每一个节点的追踪值
		show_payoff: { type: Boolean }, //是否显示每一个节点的反馈值
		show_tips: {type: Boolean}, //是否显示每一个节点的小贴士
		align_endArea: {type: Boolean} //@TODO
	},
	//序列化反序列化的对象
	node_array: [{ //node_array， 节点信息，以对象数组方式存放
		node_id: {type: Number}, //节点id,
		parent_id: {type: Number}, //父节点id，根节点此值为空
		node_path_array: [//节点路径，存放路径节点id
			{type: Number}
		],
		name: {type: String }, //节点名称
		tip: {type: String}, //节点小贴士
		type: {type: String}, //节点类型, decision, change, termial
		markov_info: [ //存马尔科夫信息
			{type: String}
		],
		show_child: {type: Boolean}, //此节点的子树是否折叠起来的标志
		show_tip: {type: Boolean}, //@TODO
		prob: {type: String}, //节点概率,同求0.125数值表达是否更好
		redefined_param_array: [{ //该节点上所定义的变量
			param_id: {type: Number},
			formula: {type: String}
		}],
		tracker_array: [ //节点追踪值
			{type: String}
		],
		payoff_array: [ //节点收益
			{type: String}
		]
		//children:[]
	}],
	param_array:  [{ //param_array，变量，以对象数组方式存放
		param_id: { type: Number }, //变量id
		name: { type: String }, //变量名称
		description: { type: String }, //变量的描述，由用户自己输入
 		formula: { type: String }, //变量的公式
		//formula_pre: {typ围绕 e: String}, //Math.js看得懂的的计算表达式
		category: { type: Number }, //变量的类别，类别可由用户定义，用于区别变量
		display: { type: Boolean }, //是否显示出来
		comment: {type: String} //用户输入的备注信息
	}],
	param_category_array: [{//category_array，变量分类目录，以对象数组方式存放
		category_id: {type: Number}, //目录id
		name: {type: String}, //目录名称
		description: {type: String} //目录描述
	}],
	table_array: [{ //table_array，表格，以对象数组方式存放
		table_id: {type: Number}, //表id,唯一
		name: {type: String}, //表名，不可为空
		description: {type: String}, //表描述，默认为空
		value: [], //相关参数，二维  有默认值
		display: {type: Boolean}, //@TODO
		comment: {type: String} //用户备注，默认为空
	}],
	distribution_array: [{ //distribution_array, 分布，以对象数组方式存放
		distr_id: {type: Number}, //分布id，唯一
		name: {type: String}, //分布名，不可为空
		description: {type: String}, //目标描述，默认为空
		type: {type: String}, //分布类型，不可为空
		value: [ //相关参数， 有默认值
			{type: Number}
		],
		display: {type: Boolean}, //@TODO
		comment: {type: String} //用户备注，默认为空
	}],
	//12/5新增
	payoff_array: [{
		payoff_id: {type: Number},
		payoff_name: {type: String},
		payoff_weight: {type: Number}
	}]
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
