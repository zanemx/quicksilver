define(['backbone','text!templates/adventure.hbs','handlebars','views/map','views/duel','views/market','views/dungeons'],function(Backbone,template,Handlebars,MapView,DuelView,MarketView,DungeonView){
	return Backbone.View.extend({
		id:'adventureView',
		className:'grid-100 tablet-grid-100 mobile-grid-100 grid-parent',
		currentView:null,
		events:{
			'click .adventure_navButton':'onNavClick'
		},

		template:Handlebars.compile(template),
		onNavClick:function(e){
			var el= $(e.currentTarget);
			var target = el.text().toLowerCase();
			this.loadSubView(target);
			AudioManager.play('tick');
		},
		loadSubView:function(view){

			// if(this.currentView == view)return;

			if(!this.views[view]){
				this.cacheSubView(view);
			}

			// set button down state
			$(".adventure_navButton").removeClass("buttonDown");
			var elem = _.find($(".adventure_navButton"),function(el){
				return $(el).text().toLowerCase() == view.toLowerCase();
			});
			$(elem).addClass('buttonDown');


			// $("#adventureSubView").empty();
			// this.views[view].delegateEvents();
			$("#adventureSubView").html(this.views[view].render().el);

			// this.currentView = view;

			window.localStorage.setItem('quicksilver_save_last_game_adventureSubView',view);
		},

		cacheSubView:function(view){
			switch(view){
				case 'quest':this.addSubView('quest',new MapView);break;
				case 'dueling': this.addSubView('dueling',new DuelView);break;
				case 'market': this.addSubView('market',new MarketView);break;
				case 'dungeons': this.addSubView('dungeons',new DungeonView);break;
			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		loadLastView:function(){
			var lastView = window.localStorage.getItem("quicksilver_save_last_game_adventureSubView");
			if(lastView)
				this.loadSubView(lastView);
			else
				this.loadSubView('quest');
		},
		initialize:function(){
			this.views = {}
		},
		render:function(){

			this.$el.html(this.template({}));
			_.defer(this.delegateEvents.bind(this));
			_.defer(function(){
				// this.loadLastView();
			}.bind(this));
			
			log('adventure')
			return this;
		}
	});
})