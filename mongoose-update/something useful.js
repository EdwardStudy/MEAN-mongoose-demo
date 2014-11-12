			//读取决策树数据函数
			$scope.selectDtreeData = function (name) {
				createDtreeService.get({DTreeParam: name}, function (data) {
					$scope.treeStructure = data.structure;
					$scope.treeConfig = data.config;
					$scope.treeParameter = data.parameter;

					$scope.canvasUiStyle = data.config.layout_style;

					$scope.generalGridData = [
						{"property": "name", "value": data.config.name}
						,
						{"property": "description", "value": data.config.description}
						,
						{"property": "creator", "value": $scope.user.local.email || $scope.user.facebook.name}
					]
				});
			}
			//初始化结构信息@todo delete
			$scope.selectDtreeData("DTree-structure");


			function rootFirstTraversalStructure(operation) {
				var getChildren = function (d) {
					var d_children = d.children && d.children.length > 0 ? d.children : null;
					d_children = d._children && d._children.length > 0 ? d._children : null || d_children;
					return d_children;
				}
				var rootFirstTraversal = function (d) {
					if (!d) return;
					operation(d);
					var d_children = getChildren(d);
					if (d_children) {
						for (var i = 0; i < d_children.length; i++) {
							rootFirstTraversal(d_children[i]);
						}
					}
				}
				rootFirstTraversal($scope.treeStructure);
			}
