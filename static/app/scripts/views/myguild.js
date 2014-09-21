define(['backbone','handlebars','text!templates/myguild.hbs','ajax','models/guild'],function(Backbone,Handlebars,template,ajax,GuildModel){
	return Backbone.View.extend({
		id:"myguildView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		guilds:[],
		events:{
			'click #disbandGuild':'onDisbandGuild',
			// 'click .guildTitle':'onSelectGuild',
			'click #invite':'onInvite',
			'click #leaveGuild':'onLeaveGuild',
			'click #kickMember':'onKickMember'
		},
		onKickMember:function(){
			var name = window.prompt("Name of player? 'case sensitive'");
			if(name){
				this.mGuild.kickMember(name);
			}
		},	
		onLeaveGuild:function(){
			this.confirm('Leave Guild','Are you sure you want to leave ' + this.mGuild.get("name") + '?',null,function(rr){
				if(rr){
					this.mGuild.leaveGuild();
				}
			}.bind(this));	
		},
		onInvite:function(){
			var name = window.prompt("What is the name of the player? 'case sensitive'");
			if(name){
				this.mGuild.inviteToGuild(name);
			}
		},
		// onSelectGuild:function(e){
		// 	var el = $(e.currentTarget);
		// 	var name = el.attr("_id");
		// 	var guild = _.find(this.mGuilds,function(guild){
		// 		return guild.name == name;
		// 	});

		// 	this.context.guildDetails = guild;
		// 	this.render();
		// },
		onDisbandGuild:function(){

			this.confirm('ATTENTION','Are you sure you want to disband ' + this.mGuild.get("name") + '?',null,function(rr){
				if(rr){
					this.model.disband(this.mGuild.get('name'));
				}
			}.bind(this));
		},	
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.render();
		},
		render:function(){
			this.mGuild = Backbone.Model.instances.guild;
			var context = this.mGuild.toJSON();
			var leader = context.leader.name;
			if(leader == this.model.get('name')){
				context.isLeader = true;
			}
			this.$el.html(this.template(context));
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});