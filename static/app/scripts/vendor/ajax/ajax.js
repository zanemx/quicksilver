define(["jquery"],function($){
	return {
		send:function(params,callback){
			$.post('/ajax',params,function(r){
				var data = $.parseJSON(r);
				if(callback)
					callback(data);
			});
		}
	}
});