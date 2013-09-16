define(['backbone'], function(Backbone){
	return Backbone.Model.extend({
		url:function(){
			return '/guild/' + this.get("toonName");
		}
	});
});