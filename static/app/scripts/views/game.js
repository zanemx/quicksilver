define(
	[
		'backbone',
		'handlebars',
		'text!templates/game.hbs',
		'views/stats',
		'views/home',
		'views/adventure',
		'views/city',
		'views/character',
		'views/guild',
		'views/news',
		'views/attributes',
		'views/gear',
		'views/inventory',
		'views/talent',
		'views/createguild',
		'views/myguild',
		'views/guildbenefits',
		'views/guilddiplomacy',
		'views/map',
		'views/duel',
		'views/market',
		'views/dungeons',
		'views/party',
		'views/lore',
		'views/dungeonlist',
		'views/guilds',
		'views/almanac',
		'views/professions',
		'views/crafting',
		'views/auctionbuy',
		'views/auctionsell',
		'views/navigation',

	],
	function(
		QSView,
		Handlebars,
		template,
		StatsView,

		// views
		HomeView,
		AdventureView,
		CityView,
		CharacterView,
		GuildView,
		NewsView,
		AttributesView,
		GearView,
		InventoryView,
		TalentView,
		CreateGuildView,
		MyGuildView,
		GuildBenefitsView,
		GuildDiplomacy,
		MapView,
		DuelView,
		MarketView,
		DungeonView,
		PartyView,
		LoreView,
		DungeonListView,
		GuildsView,
		AlmanacView,
		ProfessionView,
		CraftingView,
		AuctionBuyView,
		AuctionSellView,
		NavigationView
	){
	return Backbone.View.extend({

		id:'gameView',
		className:'grid-100 tablet-grid-100 mobile-grid-100 grid-parent',
		template:Handlebars.compile(template),
		currentView:null,
		navigationView:null,
		viewParams:{},

		navstack:null,
		last_navstack:null,
		nav_history:[],
		lastNavTree:null,

		views:{},

		events:{
			"click button":"onNavClick"
		},
		onMarket:function(){
			this.loadSubView('city');
			this.views[this.currentView].loadSubView('market');
		},
		onAdventure:function(){
			this.loadSubView('adventure');
		},
		onAlertSidebar:function(e){
			$(".alertSidebar").removeClass('showAlertSidebar');
			this.loadSubView('home');
			this.views[this.currentView].loadSubView('news');
		},
		onInviteFriends:function(){
			this.inviteFriends();
		},
		onClose:function(){
			this.statsView.close();
			// this.views = {}
		},
		onNavClick:function(e){
			var el= $(e.currentTarget);
			log(el.text());
			this.loadView(el.text());
			// var key = el.data('key');
			// this.loadSubView(key);
			// this.updateNav(key);
			AudioManager.play('tick');
		},
		loadView:function(view){

			//close nav
			this.navigationView.close();

			if(view == "characters"){
				this.onLogout();
				return;
			}

			this.cacheSubView(view);
			if(!this.views[view]){
				this.cacheSubView(view);
			}
			$("#subView").html(this.views[view].render(this.viewParams).el);
		},
		loadSubView:function(view){
			// log('loading ' + view + ' view');

			// log(this.nav_history);

			if(view == "characters"){
				if(this.nav_history.length == 0){
					this.onLogout();
					return;
				}
				else if(this.nav_history.length==1){
					view = 'lore';
				}else{
					view = this.nav_history[this.nav_history.length-1];
				}

			// special case for market sub views
			}else if(view == 'equipment' || view == 'mounts' || view == 'potions'){
				this.viewParams.subView = view;
				view = 'market';
			}
			// else if (view == 'crafting'){
			// 	view = 'profession';
			// }

			if(!this.views[view]){
				this.cacheSubView(view);
			}

			// set button down state
			$(".main_navButton").removeClass("buttonDown");
			var elem = _.find($(".main_navButton"),function(el){
				return $(el).text().toLowerCase() == view.toLowerCase();
			});
			$(elem).addClass('buttonDown');


			$("#subView").html(this.views[view].render(this.viewParams).el);

			this.currentView = view;

			window.localStorage.setItem('quicksilver_save_last_game_subView',view);
		},

		cacheSubView:function(view){
			switch(view){

				case 'lore':this.addSubView('lore',new LoreView);break;
				case 'home':this.addSubView('home',new HomeView);break;
				case 'adventure':this.addSubView('adventure',new AdventureView);break;
				case 'city':this.addSubView('city',new CityView);break;
				case 'crafting':this.addSubView('crafting',new CraftingView);break;
				case 'profession':this.addSubView('profession',new ProfessionView);break;
				case 'buy':this.addSubView('buy',new AuctionBuyView);break;
				case 'sell':this.addSubView('sell',new AuctionSellView);break;
				// home views
				case 'character':this.addSubView('character',new CharacterView);break;
				case 'guild': this.addSubView('guild',new GuildView);break;
				case 'news': this.addSubView('news',new NewsView);break;
				// character views
				case 'attributes': this.addSubView('attributes',new AttributesView);break;
				case 'gear':this.addSubView('gear',new GearView);break;
				case 'inventory':this.addSubView('inventory',new InventoryView);break;
				case 'talents':this.addSubView('talents',new TalentView);break;
				//guild views
				case 'create': this.addSubView('create', new CreateGuildView);break;
				case 'manage': this.addSubView('manage',new MyGuildView);break;
				case 'benefits': this.addSubView('benefits',new GuildBenefitsView);break;
				case 'diplomacy': this.addSubView('diplomacy',new GuildDiplomacy);break;
				// adventure views
				case 'quest':this.addSubView('quest',new MapView);break;
				case 'dueling': this.addSubView('dueling',new DuelView);break;
				case 'dungeon': this.addSubView('dungeon',new DungeonView);break;

				case 'party': this.addSubView('party',new PartyView);break;			
				case 'dungeons': this.addSubView('dungeons',new DungeonListView);break;
				case 'almanac': this.addSubView('almanac',new AlmanacView);break;
				// city views
				case 'market':this.addSubView('market',new MarketView);break;
				case 'equipment':
					log('sort market view');
					break;
				case 'mounts':
					break;
				case 'potions':
					break;
				case 'guilds':this.addSubView('guilds',new GuildsView);break;


			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		onLogout:function(){
			var div = $(document.createElement('div')).addClass("box").css({
				'margin':'auto',
				'text-align':'center',
				'margin-top':'44%'
			}).text("Loading your Quickislver minions.");

			// http://localhost:8010/#characterlist/localhost_user
			this.$el.html(div);
			// Backbone.history.navigate('/',{trigger:true});
			Backbone.history.navigate('#characterlist/' + this.model.get("user"),{trigger:true});
		},

		initialize:function(){
			var self = this;

			this.constructor.__super__.initialize.apply(this);
			// this.__super__();
			window.view= this;

			//key to open menu

			this.navigationView = new NavigationView;

			// this.views = {}
			this.model = Backbone.Model.instances.toon;
			vent.on('level_up',function(){
				var level = parseInt(this.model.get('level')) + 1;
				AnimationManager.blit("Level Up! (" + level + ")", "lime");
			}.bind(this));
			this.statsView = new StatsView;
			this.render();

			// // load default view
			// this.loadSubView('lore');

			//listen for touch events 
			// $(document).on("swiperight",function(event){
			// 	log("i got swipped");
			// 	alert("swipe right");
			// 	self.navigationView.open();
			// });
			$(document).keydown(function(e){
				var code = e.keyCode;
				log(code);
				if(code == 32){//spacebar 
					self.navigationView.open();
				}
			});

			var startX = 0;
			document.addEventListener("touchstart",function(e){
				log(e);
				e.preventDefault();
				var touch = e.touches[0];
				startX = touch.pageX;
			});
			document.addEventListener("touchend",function(e){
				var touch = e.changedTouches[0];
				if(startX + 40 < touch.pageX){//right swipe
					self.navigationView.open();
				}else if(startX - 40 > touch.pageX){//left swipe
					self.navigationView.close();
				}
			});
			document.addEventListener("mousedown",function(e){
				startX = e.x;
			});
			document.addEventListener("mouseup",function(e){
				if(startX + 40 < e.x){//right swipe
					self.navigationView.open();
				}else if(startX - 40 > e.x){//left swipe
					self.navigationView.close();
				}
			});
		},
		render:function(){
			this.$el.html(this.template({}));
			_.defer(function(){
				this.delegateEvents();
				// this.updateNav();
			}.bind(this));
			// _.defer(this.loadLastView.bind(this));

			// ADD el TO DOM BEFORE REFERENCING ELEMENTS WITH JQUERY
			$(".wrapper").html(this.el);
			$("#statsContainer").html(this.statsView.el);
			$("#navigation-view-container").append(this.navigationView.el);

			$("*").on("swiperight",function(event){
				log("i got swipped");
				alert("swipe right");
				self.navigationView.open();
			});

			return this;
		}
	});
});