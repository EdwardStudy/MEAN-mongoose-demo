var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Dtree = mongoose.model('DTree');
var fs = require('fs');
var assert = require('assert');
//加载underscore库
var _ = require("underscore")._;

mongoose.model('DTree');

exports.dTreeAdd = function (req, res) {
    if (req.params.name) {//update
        res.render('dTree', {
            title: req.params.name + ' Management',
            label: 'Edit: ' + req.params.name,
            dtree: req.params.name
        });
    } else {
        res.render('dTree', {
            title: 'Add Management',
            label: 'Add',
            dtree: false
        });
    }
};

exports.doDTreeAdd = function(req, res){
    console.log("Now");
    fs.readFile(__dirname + '/../testjson/new_structure.json', 'utf8', function (err, data) {
        if(err) throw err;
        var json = JSON.parse(data);
        if(json._id){//update
            console.log("Now updating");
        }else{//insert
            Dtree.create(json, function(err, dtree, numAffected){
                if(err){
                    res.send({'success':false,'err':err});
                }else{
                    //res.send({'success':true});
                    //console.log("dtree created and saved: " + dtree);
                    res.redirect('/');
                }
            });
        }
    });
};


exports.doSerialize = function (req, res) {
    fs.readFile(__dirname + '/../testjson/trees.json', 'utf8', function (err, data) {
        if (err) throw err;

        console.log(typeof(data));
        var dtreeJsonData = JSON.parse(data);
        //参数node_array为树结构，变量node_array为数组结构
        var node_array = dtreeToArray(dtreeJsonData.node_array);

        //向数据库更新部分内容
        Dtree.update({"_id": dtreeJsonData._id}, {"node_array": node_array, "config.last_saved": Date.now()}, function(err){
                if(err){
                    res.send({'success':false,'err':err});
                }else{
                    //res.send({'success':true});
                    //console.log("dtree created and saved: " + dtree);
                    res.redirect('/');
                }
        });
    });
};

//将读取数据库的数据，将其node_array的节点反序列化
exports.deserialize = function (req, res) {
    var checkId = new ObjectId('54a4c0947752adcc1764f0d4');
    var node_array;
    var nodes;
    Dtree.findById(checkId).lean().exec(function (err, dtree) {
        node_array = dtree.node_array;
        console.log(dtree);
        console.log('node_array: ', node_array);
        nodes = arrayToTree(node_array);
        //排序
        //nodes = sortNodes(nodes);
        console.log('nodes: ', JSON.stringify(nodes));
        dtree.node_array = nodes;


        //将结果输出到文件
        fs.writeFile(__dirname + '/../testjson/trees.json', JSON.stringify(dtree), function (err) {
            if (err) throw err;
            console.log("It's writed.");
        });

        res.render('deserialize', {
            title: 'deserialize',
            node_array: node_array,
            nodes: JSON.stringify(nodes)
            //dtree: false
        });
    });
};

exports.pickDtree = function (req, res) {
    fs.readFile(__dirname + '/../testjson/front_dtree.json', 'utf8', function (err, data) {
        if (err) throw err;

        console.log(typeof(data));
        var dtreeJsonData = JSON.parse(data);

        //查询依据
        var id = new ObjectId('54a4c0947752adcc1764f0d4');
        console.log(id.toString);

        //参数node_array为树结构，变量node_array为数组结构
        var node_array = dtreeToArray(dtreeJsonData.node_array);

        dtreeJsonData.node_array = node_array;
        dtreeJsonData.config.last_saved = Date.now();
        //挑选需要存入数据库的内容
        dtreeJsonData = pickDTree(dtreeJsonData);
       // console.log(dtreeJsonData);
        //向数据库更新部分内容
        Dtree.update({"_id": id}, dtreeJsonData, function(err){
            if(err){
                res.send({'success':false,'err':err});
            }else{
                //res.send({'success':true});
                //console.log("dtree created and saved: " + dtree);
                res.redirect('/');
            }
        });
    });
};

exports.dTreeJSON = function (req, res) {
    Dtree.findByName(req.params.name, function (err, obj) {
        res.send(obj);
    });
};

//决策时树的序列化
/**
 * @function dtreeToArray
 * @desc 调用递归方法.serialize()，将dtree的树结构节点序列化为数组
 * @param {Object Node} nodes 树结构的节点dtree文档中的node_array节点
 * @return {Array} node_array 升序节点数组
 */
var dtreeToArray = function (nodes) {
    var node_array = [];

    node_array = serialize(nodes, node_array).node_array;
    node_array.sort(function (a, b) {
        return a.node_id - b.node_id
    });

    //console.log(node_array);
    return node_array;
};

/**
 * @function serialize
 * @desc 递归调用，先序优先历遍每个节点，将节点的子节点存入数组
 * @param {Object Node} node 树结构的节点集，递归时为存入node_array的元素(节点)
 * @param {Array} node_array 数组结构的节点集
 * @return {Object Node} node 包含树结构的节点，每次递归，节点的children数组元素(节点)少一
 * @return {Array} node_array 数组结构的节点集，每次递归，该数组元素(节点)添一
 */
var serialize = function (node, node_array) {

    while(node.children.length){
        node_array = serialize(node.children [0], node_array).node_array;
        node.children.splice(0, 1); //.splice(i, 1) 删除node.children[]中index i的元素
        //需要注意 当子节点children数组为空，此步无效
    }
    node_array.push(node); //.push()到node_array

    return ({node: node, node_array: node_array});
};

//反序列化
/**
 * @function arrayToTree
 * @desc 将dtree的节点反序列化为树结构
 * @param {Array} node_array dtree文档中的node_array节点数组
 * @return {Object Node} temp_array[0] 包含树结构的根节点
 */
var arrayToTree = function (node_array) {
    var temp_array = node_array;

    //将节点数组升序
    temp_array.sort(function (a, b) {
        return a.node_id - b.node_id
    });

    //节点的children定义为空数组，不存入数据库
    node_array.forEach(function (node) {
        node.children = []; //children is Array
        node._children = []; //children is Array
    });

    for(var i=0; i<node_array.length; i++) {
        if(node_array[i].parent_id){
            for(var j=0; j<temp_array.length; j++){
                if(node_array[i].parent_id == temp_array[j].node_id){
                    if(temp_array[j].show_child){
                        temp_array[j].children.push(node_array[i]);
                    }else{
                        temp_array[j]._children.push(node_array[i]);
                    }
                    break;
                }
            }
        }
    }

    ////从下往上将每个节点添加到父节点的children数组中
    //var i = 0;
    //var count = temp_array.length;
    //for (i = (count - 1); i > 0; i--) {
    //    if (temp_array[temp_array[i].parent_id - 1] !== null) {
    //        var tNode = temp_array[i];
    //        temp_array[tNode.parent_id - 1].children.push(tNode);;
    //    }
    //}

    return temp_array[0];
};

/**
 * @function sortNodes
 * @desc 将树的每层子节点排序，递归
 * @param {Object Node} nodes 包含树结构的根节点，子节点的顺序为降序
 * @return {Object Node} nodes 原物奉还，各子节点数组的顺序为升序
 */
var sortNodes = function (nodes) {
    if (nodes.children.length > 0) {
        var i = 0;
        for (; i < nodes.children.length; i++) {
            nodes.children[i] = sortNodes(nodes.children[i]);
        }
        nodes.children.sort(function (a, b) {
            return a.node_id - b.node_id
        });
    }

    return nodes;
};

/**
 * @function pickDTree
 * @desc 调用underscore库的函数pick，选择要存入数据库的key(调用underscore的API .map .pick)
 * @param {Object DTree} dtree 前端传过来的决策树，已经序列化
 * @return {Object DTree} dtree 与数据库结构一致的决策树数据
 */
var pickDTree = function (dtree) {
    //node_array部分
    //node_array有单纯的key，也有object需区分
    //将node_array中的5个Array进行提取
    var node_path_array;
    var redefined_param_array;
    var tracker_array;
    var payoff_array;
    var markov_info;
    for(var i = 0; i < dtree.node_array.length; i++){
        //node_path_array目前无筛选，没有key进行定位
        node_path_array = dtree.node_array[i].node_path_array;

        //redefined_param_array筛选
        redefined_param_array = dtree.node_array[i].redefined_param_array;

        dtree.redefined_param_array = _.map(dtree.redefined_param_array, function(currentObj){
            return _.pick(currentObj,
                "param_id",
                "formula"
            );
        });

        //下列三个array目前无筛选，没有key进行定位
        tracker_array = dtree.node_array[i].tracker_array;
        payoff_array = dtree.node_array[i].payoff_array;
        markov_info = dtree.node_array[i].markov_info;

        dtree.node_array[i] = _.pick(dtree.node_array[i],
            "node_id",
            "parent_id",
            "name",
            "tip",
            "type",
            "show_child",
            "show_tip",
            "prob"
        );

        dtree.node_array[i].node_path_array = node_path_array;
        dtree.node_array[i].redefined_param_array = redefined_param_array;
        dtree.node_array[i].tracker_array = tracker_array;
        dtree.node_array[i].payoff_array = payoff_array;
        dtree.node_array[i].markov_info = markov_info;
    }

    //其他部分
    dtree.config = _.pick(dtree.config,
        "name",
        "description",
        "last_saved",
        "security_level",
        "layout_style",
        "layer_width",
        "show_title",
        "show_info",
        "show_param",
        "show_tracker",
        "show_payoff",
        "show_tips",
        "align_endArea"
    );

    dtree.param_array = _.map(dtree.param_array, function(currentObj){
        return _.pick(currentObj,
            "param_id",
            "name",
            "description",
            "formula",
            "category",
            "display",
            "comment"
        );
    });

    dtree.param_category_array = _.map(dtree.param_category_array, function(currentObj){
        return _.pick(currentObj,
        "category_id",
        "name",
        "description"
        );
    });

    dtree.table_array = _.map(dtree.table_array, function(currentObj){
        return _.pick(currentObj,
        "table_id",
        "name",
        "description",
        "value",
        "comment"
        );
    });

    dtree.distribution_array = _.map(dtree.distribution_array, function(currentObj){
        return _.pick(currentObj,
        "distr_id",
        "name",
        "description",
        "type",
        "value",
        "display",
        "comment"
        );
    });

    dtree.payoff_array = _.map(dtree.payoff_array, function(currentObj){
        return _.pick(currentObj,
            "payoff_id",
            "payoff_name",
            "payoff_weight"
        );
    });

    return dtree;
};