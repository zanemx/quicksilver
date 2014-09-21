define(['backbone','handlebars','text!templates/city.hbs','ajax','views/market','views/guilds'],function(Backbone,Handlebars,template,ajax,MarketView,GuildsView){
	return Backbone.View.extend({
		id:"cityView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		currentView:null,
		events:{
			'click .city_navButton':'onNavClick'
		},
		onNavClick:function(e){
			AudioManager.play('tick');
			var el= $(e.currentTarget);
			var target = el.text().toLowerCase();

			if(target === 'tavern'){
				this.onLogout();
				return;
			}

			this.loadSubView(target);
			
		},
		onLogout:function(){
			// var div = $(document.createElement('div')).addClass("box").css({
			// 	'margin':'auto',
			// 	'text-align':'center',
			// 	'margin-top':'44%'
			// }).text("Loading your Quickislver minions.");

			// http://localhost:8010/#characterlist/localhost_user
			// this.$el.html(div);
			// Backbone.history.navigate('/',{trigger:true});
			Backbone.history.navigate('#characterlist/' + this.model.get("user"),{trigger:true});
			AudioManager.play('timpani');
			$("#gameView").empty();
		},
		loadSubView:function(view){

			if(!this.views[view]){
				this.cacheSubView(view);
			}

			// set button down state
			$(".city_navButton").removeClass("buttonDown");
			var elem = _.find($(".city_navButton"),function(el){
				return $(el).text().toLowerCase() == view.toLowerCase();
			});
			$(elem).addClass('buttonDown');

			$("#citySubView").html(this.views[view].render().el);

			window.localStorage.setItem('quicksilver_save_last_game_citySubView',view);
		},

		cacheSubView:function(view){
			switch(view){
				case 'market':this.addSubView('market',new MarketView);break;
				case 'guilds':this.addSubView('guilds',new GuildsView);break;
			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		loadLastView:function(){
			var lastView = window.localStorage.getItem("quicksilver_save_last_game_citySubView");
			if(lastView)
				this.loadSubView(lastView);
			else
				this.loadSubView('market');
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.views = {}
			_.bind(this.render,this);
			this.render();
		},
		render:function(){
			log("render city view");
			var context = {}
			this.$el.html(this.template(context));
			_.defer(function(){
				// this.loadLastView();
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});