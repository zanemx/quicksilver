define(['backbone','models/character'],function(Backbone,Character){
	return Backbone.Collection.extend({

		initialize:function(id){
			this.id = id;
		},

		model:Character,
		url:function(){
			return '/character?userid=' + this.id
		}
	});
});