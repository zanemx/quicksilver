define(['backbone','handlebars','text!templates/guildcreate.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:"createView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		events:{
			'click #createGuild':'onCreateGuild'
		},
		onCreateGuild:function(){
			var guildName = $("#guildName").val();
			if(!guildName){
				alert("please enter a guild name");
				return;
			}
			this.model.createGuild(guildName);
		},

		initialize:function(){
			this.model = Backbone.Model.instances.toon;
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