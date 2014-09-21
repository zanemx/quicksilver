define(['backbone','models/character'],function(Backbone,Character){
	return Backbone.Collection.extend({

		initialize:function(models,options){
			this.userid=options.userid
		},

		model:Character,
		url:function(){
			return 'characters/' + this.userid;
		}
	});
});