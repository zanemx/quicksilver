define(['backbone'],function(Backbone){
	return Backbone.Model.extend({
		url:function(){
			return '/quest/' + this.id;
		}
	});
});