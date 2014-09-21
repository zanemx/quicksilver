define(
	[
		'jquery',
		'backbone',
		'models/user',
		'views/app',
		'views/characterCreate',
		'models/character',
		'views/characterList',
		'views/preloader',
		'views/game',
		'views/questmaker',
		'views/interactivemap',
		'ajax'
	],
	function($,Backbone,User,AppView,CharacterView,CharacterModel,CharacterListView,PreloaderView,GameView,QuestMakerView,InteractiveMap,ajax){

	var Router =  Backbone.Router.extend({

		currentView:null,
		preloader:null,
		user:null,

		initialize:function(){

			// ADD PRELOADER MESSAGE
			$(".wrapper")
				.html('<div id="preloader" style="text-align:center; margin:auto; margin-top:44%;" class="box"><h4>Loading Quicksilver. It will just be a moment.</h4></div>');

			var moco_token = $.getUrlVar('accessToken');
			if(moco_token == undefined)
				moco_token = 'g2f39ckuq8vo|ydfmn';

			$.get('https://apps.mocospace.com/social/people/@me/@self?oauth_token=' + moco_token, function(r){

				$.get('https://apps.mocospace.com/social/people/@me/@friends?oauth_token=' + moco_token,function(r){
					Backbone.config.friends = r.entry;
				});

				var id = r.entry.id;
				var params = {
					action:'getUser',
					userid:id,
					access_token:moco_token
				}
				ajax.send(params,function(r){
					this.user = r.user;
				}.bind(this));
			}.bind(this));
		},
		

		loadView:function(view){
			if(this.currentView)
				this.currentView.close();
			this.currentView = view;
			MocoSpace.resizeGameIframe();
		},

		routes:{
			"":"preloader",
			"create/:id":"create",
			"characterlist/:id":"characterlist",
			"game/:id":"game",
			"questmaker":"questmaker",
			"match2":"match2"
		},

		match2:function(){
			require(['views/match2game'],function(Match2View){
				this.loadView(new Match2View);
			}.bind(this));
		},

		preloader:function(){
			var view = new PreloaderView;
			$("#start").click(function(){
				AudioManager.play('timpani');
				var toons = this.user.characters;

				if(toons.length == 0){
					this.navigate('/create/' + this.user.key,{trigger:true});
				}else{
					this.navigate('/characterlist/' + this.user.key,{trigger:true});
				}
			}.bind(this));
			
			var i = setInterval(function(){
				if(this.user){
					$("#start").css('visibility','').hide().fadeIn('slow');
					window.clearInterval(i);
				}
			}.bind(this),1000);
		},

		
		create:function(key){
			this.loadView(new CharacterView(null,key));
		},

		characterlist:function(userid){
			var view= new CharacterListView(null,userid);
		},

		// GAME VIEW
		game:function(toonkey){
			Backbone.config['toonkey'] = toonkey;
			ajax.send({action:'getToon',key:toonkey},function(r){
				if(!r.success){
					window.location.href = '/';
					return;
				}

				
				var toon = new CharacterModel(r.toon);
				Backbone.Model.instances.toon = toon;
				// window.vent.trigger(window.CHARACTER_CHANGE);
				if(!toon.get('name')){
					window.location.href = '/';
					return;
				}
				this.loadView(new GameView);
				// this.loadView(new InteractiveMap);
				
			}.bind(this));
		},

		questmaker:function(){
			var view = new QuestMakerView();
			this.loadView(view);
		}


	});
	return Router;
});