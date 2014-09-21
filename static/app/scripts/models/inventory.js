define(['backbone'],function(Backbone){
	return Backbone.Model.extend({
		url:function(){
			return '/inventory/' + Backbone.config['toonkey'];
		}
	});
});