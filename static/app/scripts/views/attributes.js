define(['backbone','handlebars','text!templates/attributes.hbs','knockout'],function(Backbone,Handlebars,template,ko){
	return Backbone.View.extend({
		id:'attributesView',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		events:{
			"click .attributesButton":"onButtonClick"
		},
		onButtonClick:function(e){
			var attribute = $(e.currentTarget).attr("data");
			this.model.save({
					action:'addSkillPoint',
					attribute:attribute
				},
				{
					success:function(){
						this.render();
					}.bind(this)
				});
		},

		initialize:function(){
			// this.model.on('change',this.render,this);
			this.render();
		},
		render:function(){
			var context = this.model.toJSON();
			this.$el.html(this.template(context));
			return this;
		}
	});
});