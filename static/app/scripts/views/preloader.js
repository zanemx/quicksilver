define(['backbone','handlebars','text!templates/preloader.hbs'],function(Backbone,Handlebars,template){

	return Backbone.View.extend({
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		id:'preloaderView',
		template:Handlebars.compile(template),
		initialize:function(){
			
			this.render();

		},
		render:function(){
			this.context = {};
			this.$el.html(this.template(this.context));
			$(".wrapper").html(this.el);
			$("#start").css("visibility",'hidden');
			return this;
		}
	});
});