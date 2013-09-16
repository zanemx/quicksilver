define(['backbone'],function(Backbone){
	return Backbone.Model.extend({
		url:function(){
			return '/character' + (this.id?('/' + this.id):'');
		}
	});
});