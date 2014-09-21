define(['backbone','handlebars','text!templates/guilds.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'guildsView',
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		context:{},
		events:{
			'click #apply':'onApply'
		},
		onApply:function(e){
			var el = $(e.currentTarget);
			ajax.send({
				action:'applyToGuild',
				name:el.attr('_data'),
				alertAction:el.text()
			},function(r){
				log(r);
				AnimationManager.blit('Sent');
			},this);

		},
		getGuilds:function(){
			ajax.send({action:'getGuilds'},function(r){
				this.context = r.guilds;
				this.render();
			},this);
		},
		initialize:function(){
			this.getGuilds();
		},
		render:function(){
			log(this.context);
			this.$el.html(this.template(this.context));
			// log(this.$el.html())
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		},
	});
});