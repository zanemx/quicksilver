define(['backbone','models/quest'],function(Backbone,QuestModel){
	return Backbone.Collection.extend({
		model:QuestModel,
		url:'/quest'
	});
});