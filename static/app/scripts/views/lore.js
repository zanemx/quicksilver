define(['backbone','handlebars','text!templates/lore.hbs'],function(Backbone,Handlebars,template){
	return Backbone.View.extend({
		id:'loreView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),
		events:{
			"click #readMore":"onReadMore",
		},
		onNavClick:function(e){
			var el= $(e.currentTarget);
			var target = el.text().toLowerCase();
			this.loadSubView(target);
			AudioManager.play('tick');
		},
		onReadMore:function(){
			$("#homeView p:gt(0)").fadeToggle();
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