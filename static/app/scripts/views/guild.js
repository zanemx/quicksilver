define(['backbone','handlebars','text!templates/guild.hbs','models/guild'],function(Backbone,Handlebars,template,GuildModel){
	return Backbone.View.extend({
		id:'guildView',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		initialize:function(_model,extras){
			var mGuild = new GuildModel({toonName:extras.toonName});
			mGuild.fetch({
				success:function(model){
					this.model = model;
					this.render();
				}.bind(this)
			});
		},
		render:function(){
			if(!this.model)return this;
			var context = this.model.toJSON();
			log(context);
			this.$el.html(this.template(context));
			return this;
		}
	});
});