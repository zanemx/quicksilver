define(['backbone','handlebars','text!templates/almanac.hbs'],function(Backbone,Handlebars,template){
	return Backbone.View.extend({
		id:'almanacView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),
		initialize:function(){
			this.views = {}
			
		},

		render:function(){
			this.$el.html(this.template({}));
			return this;
		}
	});
});