var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var Dtree = mongoose.model('DTree');
var fs = require('fs');
var assert = require('assert');


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
        //last_saved_time第一个存储不填写，存储default值
        var nodes = dtreeJsonData.node_array;
        dtreeToArray(nodes);

        //dtreeJsonData.node_array = nodes;
        //dtreeJsonData.config.last_saved_time = Date.now();

        Dtree.update({"_id": dtreeJsonData._id}, {"node_array": nodes, "config.last_saved_time": Date.now()}, function(err){
                if(err){
                    res.send({'success':false,'err':err});
                }else{
                    //res.send({'success':true});
                    //console.log("dtree created and saved: " + dtree);
                    res.redirect('/');
                }
        });

        //Dtree.remove({"_id": dtreeJsonData._id}, function(){
        //    Dtree.create(dtreeJsonData, function(err, dtree, numAffected){
        //        if(err){
        //            res.send({'success':false,'err':err});
        //        }else{
        //            //res.send({'success':true});
        //            //console.log("dtree created and saved: " + dtree);
        //            res.redirect('/');
        //        }
        //    });
        //});

    });
};

//将读取数据库的数据，将其node_array的节点反序列化
exports.deserialize = function (req, res) {
    var checkId = new ObjectId('548d8f9376f0b6841c35113f');
    var node_array;
    var nodes;
    Dtree.findById(checkId).lean().exec(function (err, dtrees) {
        //var nodes = dtrees.node_array.toString();
        //console.log(dtrees.constructor === Array);
        //var jnodes = JSON.stringify(dtrees);
        node_array = dtrees.node_array;
        console.log(dtrees);
        //res.send(node_array);
        console.log('node_array: ', node_array);
        //nodes node_array 树结构
        nodes = arrayToTree(node_array);
        //排序
        nodes = sortNodes(nodes);
        console.log('nodes: ', JSON.stringify(nodes));
        dtrees.node_array = nodes;


        //将结果输出到文件
        fs.writeFile(__dirname + '/../testjson/trees.json', JSON.stringify(dtrees), function (err) {
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

exports.dTreeJSON = function (req, res) {
    Dtree.findByName(req.params.name, function (err, obj) {
        res.send(obj);
    });
};

//树的序列化
/**
 * 调用递归方法.serialize()，将dtree的树结构节点序列化为数组
 * @function dtreeToArray
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
 * 递归，先序优先历遍每个节点，将节点的子节点存入数组
 * @function serialize
 * @param {Object Node} node 树结构的节点集，递归时为存入node_array的元素(节点)
 *         {Array} node_array 数组结构的节点集
 * @return {Object Node} node 包含树结构的节点，每次递归，节点的children数组元素(节点)少一
 *          {Array} node_array 数组结构的节点集，每次递归，该数组元素(节点)添一
 */
var serialize = function (node, node_array) {

    while (node.children.length) {
        node_array = serialize(node.children [0], node_array).node_array;
        node.children.splice(0, 1); //.splice(i, 1) 删除node.children[]中index i的元素
        //需要注意 当子节点children数组为空，此步无效
    }
    node_array.push(node); //.push()到node_array

    return ({node: node, node_array: node_array});
};

/**
 * 将dtree的节点反序列化为树结构
 * @function arrayToTree
 * @param {Array} node_array dtree文档中的node_array节点数组
 * @return {Object Node} temp_array[0] 包含树结构的根节点
 */
var arrayToTree = function (node_array) {
    var temp_array = node_array;

    //将节点数组升序
    temp_array.sort(function (a, b) {
        return a.node_id - b.node_id
    });

    //节点的children定义为空数组，@TODO 是否可以删除
    node_array.forEach(function (node) {
        //The splice() method changes the content of an array, adding new elements while removing old elements.
        //params index, remove count, insert ele
        //temp_array.splice(node.node_id - 1, 1, node._doc);
        node.children = []; //children is Array
    });

    //从下往上将每个节点添加到父节点的children数组中
    var i = 0;
    var count = temp_array.length;
    for (i = (count - 1); i > 0; i--) {
        if (temp_array[temp_array[i].parent_id - 1] !== null) {
            //.pop() 删除最后一个元素并返回 ._doc 为node对象
            var tNode = temp_array[i];
            //console.log('tNode : ', tNode);
            //是否需要建立chilren_id temp_array[tNode.parent_id].children_id = ;
            //if(){

            //}
            temp_array[tNode.parent_id - 1].children.push(tNode);
            //temp_array[tNode.parent_id].children = tNode;  children is Array
            //console.log('father node:  ',temp_array[tNode.parent_id]);
            //console.log('children' in temp_array[tNode.parent_id]);
        }
    }

    return temp_array[0];
};

/**
 * 将树的每层子节点排序，递归
 * @function sortNodes
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