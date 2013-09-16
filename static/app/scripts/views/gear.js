define(['backbone','handlebars','text!templates/gear.hbs','knockout'],function(Backbone,Handlebars,template,ko){
	return Backbone.View.extend({
		vm:{
			test:ko.observable('ko gear')
		},
		id:'gearView',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		initialize:function(){
			this.render();
		},
		render:function(){
			this.$el.html(this.template({}));
			ko.applyBindings(this.vm,this.el);
		}
	});
});