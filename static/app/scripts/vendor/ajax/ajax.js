define(["jquery"],function($){
	return {
		send:function(params,callback,context,ignore_load_indicator){
			if(!ignore_load_indicator)
				window.showLoading();

			if(Backbone.config['toonkey'])
				params['toonkey']=Backbone.config['toonkey'];
			// log(params['toonkey'])
			$.post('/ajax',params,function(r){
				var data = $.parseJSON(r);
				if(callback){
					if(context){
						callback.call(context,data);
					}
					else{
						callback(data);
					}
				}
				window.hideLoading();
			});
		}
	}
});