define(['backbone','handlebars','text!templates/navigation.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'navigationView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),
		close:function(){
			this.$el.animate({
			    left: -(this.$el.width()),
			}, 300);
			// this.$el.hide();
		},
		open:function(){
			this.$el.animate({
			    left: 0,
			}, 300);
		},
		initialize:function(){
			_.bindAll(this,"close","open");
			this.render();
		},
		render:function(){
			this.$el.html(this.template({}));
			return this;
		}
	});
});