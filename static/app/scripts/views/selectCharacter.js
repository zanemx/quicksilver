define(['backbone', 'hbs!selectCharacter'],function(Backbone,template){

	return Backbone.View.extend({

		template:template,

		initialize:function(){
			this.render();
			return this;
		},

		render:function(){
			this.$el.html(this.model.get("first") + ' ' + this.model.get("last"));
			$(document.body).html(this.el);
		}
	});

});