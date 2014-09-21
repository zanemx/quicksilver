define(['backbone','text!templates/forge.hbs','ajax','handlebars'],function(Backbone,template,ajax,Handlebars){
	return Backbone.View.extend({

		id:"forgeView",
		className:"grid-100 tablet-grid-100 mobile-grid-100 grid-parent",
		template:Handlebars.compile(template),

		initialize:function(){
			this.$el.html(this.template({}));
		},
		render:function(){
			return this;
		}
	})
});