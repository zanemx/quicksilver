define(['backbone','handlebars','text!templates/crafting.hbs'],function(Backbone,Handlebars,template){
	return Backbone.View.extend({
		id:'craftingView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),

		initialize:function(){
			// Backbone.Model.instances.toon.on('change:profession change:resources change:recipes',this.render.bind(this));
		},

		render:function(){
			var ctx = Backbone.Model.instances.toon;
			this.$el.html(this.template(ctx.toJSON()));
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});