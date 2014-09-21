define(['backbone','handlebars','text!templates/guild.hbs','views/myguild','views/guildbenefits','views/guilddiplomacy','views/createguild','models/guild'],function(Backbone,Handlebars,template,MyGuildView,GuildBenefitsView,GuildDiplomacy,CreateGuildView,GuildModel){
	return Backbone.View.extend({
		id:'guildView',
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		events:{
			'click .guild_subNavButton':'onNav'
		},
		onNav:function(e){
			var el = $(e.currentTarget);
			$(".guild_subNavButton").removeClass("buttonDown");
			el.addClass('buttonDown');
			var target = el.text().toLowerCase();
			this.loadSubView(target);

			AudioManager.play('tick');
		},
		loadSubView:function(view){
			// log(view)
			if(!this.views[view])
				this.cacheSubView(view);
			// set button down state
			$(".guild_subNavButton").removeClass("buttonDown");
			var elem = _.find($(".guild_subNavButton"),function(el){
				return $(el).text().toLowerCase() == view.toLowerCase();
			})
			$(elem).addClass('buttonDown');

			if(!this.views[view])return;
			
			$("#guildSubView").html(this.views[view].render().el);
			this.views[view].onload();

			window.localStorage.setItem("quicksilver_save_last_guildSubView",view);
		},
		cacheSubView:function(view){
			switch(view){
				case 'create': this.addSubView('create', new CreateGuildView);break;
				case 'manage': this.addSubView('manage',new MyGuildView);break;
				case 'benefits': this.addSubView('benefits',new GuildBenefitsView);break;
				case 'diplomacy': this.addSubView('diplomacy',new GuildDiplomacy);break;
			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		onGuildChange:function(){
			var guilds = this.model.get('guilds');
			if(guilds.length>0){
				Backbone.Model.instances.guild = new GuildModel(guilds[0]);
				$('.guild_subNavButton').eq(1).parent().show();
				$('.guild_subNavButton').eq(0).parent().hide();
				_.defer(function(){
					this.loadSubView('manage');	
				}.bind(this));
				
			}else{
				$('.guild_subNavButton').eq(1).parent().hide();
				$('.guild_subNavButton').eq(0).parent().show();
				_.defer(function(){
					this.loadSubView('create');
				}.bind(this));
			}
		},
		loadLastView:function(){
			var lastView = window.localStorage.getItem("quicksilver_save_last_guildSubView");
			if(lastView)
				this.loadSubView(lastView);
			else
				this.loadSubView('diplomacy');
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.views = {}

			this.model.on('change:guilds',this.onGuildChange.bind(this));
			// vent.on('guild_disband',this.onGuildChange.bind(this));
			
		},
		render:function(){
			this.$el.html(this.template({}));
			_.defer(function(){
				this.model.trigger('change:guilds');
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});