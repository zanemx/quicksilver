define(['backbone'],function(Backbone){
	return Backbone.Model.extend({
		url:function(){
			return '/inventory/' + this.get('name');
		}
	});
});