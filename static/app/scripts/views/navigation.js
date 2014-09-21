define(['backbone','handlebars','text!templates/navigation.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'navigationView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),
		initialize:function(){
			this.render();
		},
		render:function(){
			this.$el.html(this.template({}));
			return this;
		}
	});
});