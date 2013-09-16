define(
	[
		'backbone',
		'handlebars',
		'knockout',
		'text!templates/game.hbs',
		'views/stats',
		'views/mainNavBar',
		'views/home',
		'views/character',
		'views/quest',
		'views/guild',
		'views/duel',
		'views/market'
	],
	function(
		Backbone,
		Handlebars,
		ko,
		template,
		StatsView,
		MainNavbar,
		HomeView,
		CharacterView,
		QuestView,
		GuildView,
		DuelView,
		MarketView
	){
	return Backbone.View.extend({

		id:'game',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		currentView:null,

		views:{},

		events:{
			// 'click #logout':'onLogout',
			'click .main_navButton':'onNavClick'
		},
		onClose:function(){
			this.statsView.close();
			this.mainNavBar.close();
		},
		onNavClick:function(e){
			var target= $(e.currentTarget).text().toLowerCase();
			if(target ==='...')return;
			if(target === 'logout'){
				this.onLogout();
				return;
			}
			this.loadSubView(target);
		},
		loadSubView:function(view){
			if(!this.views[view]){
				this.cacheSubView(view);
			}
			$("#subView").html(this.views[view].render().el);
		},

		cacheSubView:function(view){
			switch(view){
				case 'home':this.addSubView('home',new HomeView);break;
				case 'character':this.addSubView('character',new CharacterView({model:this.model}));break;
				case 'quest':this.addSubView('quest',new QuestView(null,{mCharacter:this.model}));break;
				case 'guild': this.addSubView('guild',new GuildView(null,{toonName:this.model.get("name")}));break;
				case 'dueling': this.addSubView('dueling',new DuelView({model:this.model}));break;
				case 'market': this.addSubView('market',new MarketView({model:this.model}));break;
			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		onLogout:function(){
			Backbone.history.navigate('/',{trigger:true});
		},
		initialize:function(){

			// STATIC VIEWS
			this.statsView = new StatsView({model:this.model});
			this.mainNavBar = new MainNavbar();

			this.render();

			//uncache subviews
			this.views = {};

			this.loadSubView('market');
		},
		render:function(){
			
			this.$el.empty();
			this.$el.append(this.template({}));

			// ADD el TO DOM BEFORE REFERENCING ELEMENTS WITH JQUERY
			$(document.body).html(this.el);
			$("#statsContainer").html(this.statsView.el);
			$('nav').html(this.mainNavBar.el);
			this.delegateEvents();
			return this;
		}
	});
});