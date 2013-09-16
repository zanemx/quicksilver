define(
	[
		'jquery',
		'backbone',
		'models/user',
		'views/app',
		'views/characterCreate',
		'models/character',
		'views/characterList',
		'collections/characterCollection',
		'views/game'
	],
	function($,Backbone,User,AppView,CharacterView,CharacterModel,CharacterListView,CharacterCollection,GameView){

	var Router =  Backbone.Router.extend({

		currentView:null,

		loadView:function(view){
			if(this.currentView)
				this.currentView.close();
			this.currentView = view;
		},

		routes:{
			"":"app",
			"create/:id":"create",
			"characterlist/:id":"characterlist",
			"game/:id":"game"
		},

		app:function(){
			var moco_token = $.getUrlVar('accessToken');
			if(window.location.href.search('://localhost') > -1 || window.location.href.search('192.') > -1  || window.location.href.search('http://quicksilver-p12.appspot.com/') > -1){
				moco_token = 'g2f39ckuq8vo|ydfmn';
			}
			
			$.get('https://apps.mocospace.com/social/people/@me/@self?oauth_token=' + moco_token, function(r){
				var id = r.entry.id;
				// this.userid = r.entry.id;
				var user = new User({id:id});
				user.save(null,
				{
					success:function(model,res,options){
						var toons = model.get('characters');
						if(!toons.length){
							// log(Backbone.Router);
							// log("no toons. Routing to create some.");
							this.navigate('/create/' + id,{trigger:true});
						}else{
							// load character list view
							// log(id);
							this.navigate('/characterlist/' + id,{trigger:true});
						}
						// new AppView({model:model});
					}.bind(this),
					error:function(){
						log("error");
					}
				});
			}.bind(this));
		},

		create:function(id){
			var model = new CharacterModel({userid:id});
			this.loadView(new CharacterView({model:model}));
		},

		characterlist:function(id){

			var characterCollection = new CharacterCollection(id);
			characterCollection.fetch({
				success:function(collection){
					// var view = new CharacterListView({collection:collection},id);
					this.loadView(new CharacterListView({collection:collection},id));
				}.bind(this)
			});
		},

		// GAME VIEW
		game:function(toonName){
			var toon = new CharacterModel({id:toonName});
			toon.fetch({
				success:function(model,obj){
					// var view = new GameView({model:model});
					this.loadView(new GameView({model:model}));
				}.bind(this)
			});
		}


	});
	return Router;
});