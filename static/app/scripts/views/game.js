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
		AuctionSellView
	){
	return Backbone.View.extend({

		id:'gameView',
		className:'grid-100 tablet-grid-100 mobile-grid-100 grid-parent',
		template:Handlebars.compile(template),
		currentView:null,
		viewParams:{},

		navtree:{
			back:null,
			home:{
				back:null,
				character:{
					back:null,
					gear:null,
					attributes:null,
					inventory:null
					// profession:null
				},
				guild:{
					back:null,
					create:null,
					benefits:null,
					diplomacy:null
				},
				news:null
			},
			adventure:{
				back:null,
				quest:null,
				dueling:null,
				dungeon:{
					back:null,
					party:null,
					dungeons:null,
					almanac:null
				}
			},
			city:{
				back:null,
				market:{
					back:null,
					equipment:null,
					mounts:null,
					potions:null
				},
				guilds:null,
				crafting:{
					back:null,
					profession:null,
					buy:null,
					sell:null
				}
			}
		},

		navstack:null,
		last_navstack:null,
		nav_history:[],
		lastNavTree:null,

		views:{},

		events:{
			// 'click #logout':'onLogout',
			'click .inviteFriends':'onInviteFriends',
			'click .main_navButton':'onNavClick',
			'click .alertSidebar':'onAlertSidebar',
			'click .market':'onMarket',
			'click .adventure':'onAdventure'
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
			var key = el.data('key');
			this.loadSubView(key);
			this.updateNav(key);
			AudioManager.play('tick');
		},
		loadSubView:function(view){
			// log('loading ' + view + ' view');

			log(this.nav_history);

			if(view == 'back'){
				if(this.nav_history.length == 0){
					this.onLogout();return;	
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

				//default view
				case 'lore':this.addSubView('lore',new LoreView);break;

				// top level navigation views
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
		loadLastView:function(){
			var lastView = window.localStorage.getItem("quicksilver_save_last_game_subView");
			if(lastView)
				this.loadSubView(lastView);
			else
				this.loadSubView('home');
		},

		
		updateNav:function(target){

			
			if(target){
				if(this.nav_history[0] == target){return;}
				if(this.nav_history.length == 0 && target == 'back'){
					// this.onLogout();return;	
				}else if(target == 'back'){

					this.nav_history.pop();

					var tree = this.navtree;
					_.each(this.nav_history.reverse(),function(key){
						var t = tree[key];
						if(t) tree = t;
					});
					this.lastNavTree = tree;
					this.navstack = _.keys(tree);
					this.drawNav();

				}else{
					
					if(this.lastNavTree[target]){
						this.nav_history.unshift(target);

						var tree = this.navtree;
						_.each(this.nav_history.reverse(),function(key){
							var t = tree[key];
							if(t) tree = t;
						});
						this.lastNavTree = tree;
						this.navstack = _.keys(tree);
						this.drawNav();
					}else{
						// just draw content area ...don't update nav bar
					}
				}
			}else{
				this.drawNav();
			}

			this.last_navstack = this.navstack;

			// log(this.nav_history);
			
		},
		drawNav:function(){

			var nav = $("nav");
			nav.empty();


			for(var i = 0; i < this.navstack.length;i++){
				var n = this.navstack[i];
				var data = n;
				var cls = 'grid-25 tablet-grid-25 mobile-grid-25';
				if(n=='back'){
					cls = 'grid-25 tablet-grid-25 mobile-grid-25';
					n='back';
				}

				var div = $(document.createElement('div')).addClass(cls).css({
					'padding':'0px'
				});
				var btn = $(document.createElement('button')).text(n).addClass("main_navButton").css({
					'width':'100%',
					'min-width':'0px',
					'margin':'auto'
				}).data('key',data);
				div.append(btn);
				nav.append(div);
			}

			// log(this.nav_history);
		},

		initialize:function(){

			this.navstack = _.keys(this.navtree);
			this.lastNavTree = this.navtree;
			

			// this.constructor.__super__.initialize.apply(this);
			// this.__super__();
			window.view= this;
			this.views = {}
			this.model = Backbone.Model.instances.toon;
			vent.on('level_up',function(){
				var level = parseInt(this.model.get('level')) + 1;
				AnimationManager.blit("Level Up! (" + level + ")", "lime");
			}.bind(this));
			this.statsView = new StatsView;
			this.render();

			// load default view
			this.loadSubView('lore');

		},
		render:function(){
			
			this.$el.html(this.template({}));
			_.defer(function(){
				this.delegateEvents();
				this.updateNav();
			}.bind(this));
			// _.defer(this.loadLastView.bind(this));

			// ADD el TO DOM BEFORE REFERENCING ELEMENTS WITH JQUERY
			$(".wrapper").html(this.el);
			$("#statsContainer").html(this.statsView.el);
			return this;
		}
	});
});