define(['backbone','models/character'],function(Backbone,Character){
	return Backbone.Collection.extend({
		model:Character
	});
});