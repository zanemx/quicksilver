define(['backbone','handlebars','text!templates/mainNavBar.hbs'],function(Backbone,Handlebars,template ){
	return Backbone.View.extend({
		id:'mainNavBar',
		className:'grid-100 tablet-grid-100 mobile-grid-100 box',
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