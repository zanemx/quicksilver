define(['backbone','handlebars','text!templates/guilddiplomacy.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'homeView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),
		events:{

		},

		initialize:function(){
			
		},

		render:function(){
			this.$el.html(this.template({}));
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});