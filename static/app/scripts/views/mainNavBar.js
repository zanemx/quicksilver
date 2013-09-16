define(['backbone','handlebars','text!templates/mainNavBar.hbs'],function(Backbone,Handlebars,template ){
	return Backbone.View.extend({
		id:'mainNavBar',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		initialize:function(){
			this.render();
		},
		render:function(){
			this.$el.html(this.template({}));
			return this;
		}
	})
});