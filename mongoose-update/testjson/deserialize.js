/**
 * 将dtree的节点反序列化为树结构
 * @function arrayToTree
 * @param {Array} node_array dtree文档中的node_array节点数组
 * @return {Object Node} temp_array[0] 包含树结构的根节点
 */
var arrayToTree = function(node_array){
    var temp_array = node_array;

    //将节点数组升序
    temp_array.sort(function(a, b){
        return a.node_id-b.node_id
    });

    //节点的children定义为空数组，@TODO 是否可以删除
    node_array.forEach(function(node){
        node.children = []; //children is Array
    });

    //从下往上将每个节点添加到父节点的children数组中
    var i = 0;
    var count = temp_array.length;
    for(i = (count - 1); i > 0; i-- ){
        if(temp_array[temp_array[i].parent_id - 1] !== null){
            var tNode = temp_array[i];
            temp_array[tNode.parent_id - 1].children.push(tNode);
        }
    }

    return temp_array[0];
}

/**
 * 将树的每层子节点排序，递归
 * @function sortNodes
 * @param {Object Node} nodes 包含树结构的根节点，子节点的顺序为降序
 * @return {Object Node} nodes 原物奉还，各子节点数组的顺序为升序
 */

var sortNodes = function(nodes){
    if(nodes.children.length > 0){
        var i = 0;
        for(; i < nodes.children.length; i++){
            nodes.children[i] = sortNodes(nodes.children[i]);
        }
        nodes.children.sort(function(a, b){
            return a.node_id-b.node_id
        });
    }

    return nodes;
}