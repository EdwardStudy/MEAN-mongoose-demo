$(function() {
	var tdata={};
	var url = '/javascripts/import.json';

	var dtree=$('#c_editor').attr('dtree');
	if(dtree){
		url = '/dtree/json/'+dtree;
	}

	$.getJSON(url, function(data) {
		tdata=data;
	  	render_editor_form(tdata);
	  	render_event_form(tdata);
	});

	var render_editor_form=function(data){
		$('#c_editor').val($.toJSON(data));
	};

	var render_event_form=function(){
		$('#c_save').on('click',function(event){
			var data = {};
			data['content'] = tdata;

			$.ajax({
			  type: "POST",
			  url: '/dtree/add',
			  data: data,
			  success: function (data, textStatus){
			  	  if(data.success){
			  	  	$('#msg').html('成功保存!');
			  	  	$('#msg').addClass('alert alert-success');
			  	  	$(location).attr('href','/dtree/'+tdata.name);
			  	  } else {
			  	  	$('#msg').html(data.err);
			  	  	$('#msg').addClass('alert alert-error');
			  	  }
			  }
			});
		});
	};	
});