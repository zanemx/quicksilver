define(['backbone','handlebars','text!templates/dungeons.hbs','ajax','views/party','views/dungeonlist','views/almanac'],function(Backbone,Handlebars,template,ajax,PartyView,DungeonListView,AlmanacView){
	return Backbone.View.extend({
		id:"dungeonsView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		currentView:null,
		events:{
			'click .dungeons_navButton':'onNavClick'
		},
		onNavClick:function(e){
			var el= $(e.currentTarget);
			var target = el.text().toLowerCase();
			this.loadSubView(target);
			AudioManager.play('tick');
		},
		loadSubView:function(view){

			// if(view == this.currentView)return;
			// log("dungeon bindings good")

			if(!this.views[view]){
				this.cacheSubView(view);
			}

			// set button down state
			$(".dungeons_navButton").removeClass("buttonDown");
			var elem = _.find($(".dungeons_navButton"),function(el){
				return $(el).text().toLowerCase() == view.toLowerCase();
			});
			$(elem).addClass('buttonDown');

			// this.views[view].delegateEvents();
			$("#dungeonsSubView").html(this.views[view].render().el);

			// this.currentView = view;

			window.localStorage.setItem('quicksilver_save_last_game_dungeonsSubView',view);
		},

		cacheSubView:function(view){
			switch(view){
				case 'party':this.addSubView('party',new PartyView);break;
				case 'dungeons':this.addSubView('dungeons',new DungeonListView);break;
				case 'almanac':this.addSubView('almanac',new AlmanacView);break;
			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		loadLastView:function(){
			var lastView = window.localStorage.getItem("quicksilver_save_last_game_dungeonsSubView");
			if(lastView)
				this.loadSubView(lastView);
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.views = {}
			_.bind(this.render,this);
			this.render();
		},
		render:function(){
			var context = {}
			this.$el.html(this.template(context));
			_.defer(this.delegateEvents.bind(this));
			// _.defer(function(){
			// 	this.loadLastView();
			// }.bind(this));
			return this;
		}
	});
});