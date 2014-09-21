define(['backbone','models/quest'],function(Backbone,QuestModel){
	return Backbone.Collection.extend({
		initialize:function(models,options){
			this.name = options.name;
		},
		model:QuestModel,
		url:function(){
			return 'quests/' + Backbone.config['toonkey'];
		}

	});
});