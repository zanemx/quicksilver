define(['backbone','handlebars','text!templates/home.hbs','ajax','moment','views/character','views/guild','views/news'],function(Backbone,Handlebars,template,ajax,moment,CharacterView,GuildView,NewsView){
	return Backbone.View.extend({
		id:'homeView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),
		events:{
			"click .dismiss":"onDismiss",
			"click #readMore":"onReadMore",
			"click .home_navButton":"onNavClick",
			"click #homeLeaveFeedback":'onFeedback'
		},
		onFeedback:function(){
			var m = $("#feedback").val();
			if(!m){
				alert('please add some content to your message');
				return;
			}
			ajax.send({action:'leaveFeedback',message:m},function(r){
				if(!r.success){
					alert(r.error);
					return;
				}
				window.AnimationManager.blit('success');
			},this);
		},
		onNavClick:function(e){
			var el= $(e.currentTarget);
			var target = el.text().toLowerCase();
			this.loadSubView(target);
			AudioManager.play('tick');
		},
		onReadMore:function(){
			$("#homeView p:gt(0)").fadeToggle();
		},
		loadSubView:function(view){
			if(!this.views[view]){
				this.cacheSubView(view);
			}

			// set button down state
			$(".home_navButton").removeClass("buttonDown");
			var elem = _.find($(".home_navButton"),function(el){
				return $(el).text().toLowerCase() == view.toLowerCase();
			});
			$(elem).addClass('buttonDown');

			$("#homeSubView").html(this.views[view].render().el);

			window.localStorage.setItem('quicksilver_save_last_home_subView',view);
		},

		cacheSubView:function(view){
			switch(view){
				case 'character':this.addSubView('character',new CharacterView);break;
				case 'guild': this.addSubView('guild',new GuildView);break;
				case 'news': this.addSubView('news',new NewsView);break;
			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		loadLastView:function(){
			var lastView = window.localStorage.getItem("quicksilver_save_last_home_subView");
			if(lastView)
				this.loadSubView(lastView);
		},

		initialize:function(){
			this.views = {}
			
		},

		render:function(){
			this.$el.html(this.template({}));
			_.defer(function(){
				// $("#homeView p:gt(0)").hide();
				// this.loadLastView();
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});