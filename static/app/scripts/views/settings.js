define(['backbone','text!templates/settings.hbs','handlebars'],function(Backbone,template,Handlebars){
	return Backbone.View.extend({
		id:'settingsView',
		className:'mobile-grid-100 box',
		template:Handlebars.compile(template),
		initialize:function(){

		},
		render:function(){
			var context = this.template({});
			this.$el.html(context);
			return this;
		}
	});
})