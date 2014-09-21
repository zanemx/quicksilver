define(['backbone','models/alert'],function(Backbone,Alert){
	return Backbone.Collection.extend({
		initialize:function(models,options){
			this.name = options.name;
		},
		model:Alert,
		url:function(){
			log(this.name);
			return 'alerts?toonName=' + this.name;
		}
	});
});