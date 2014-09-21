define(['backbone','handlebars','text!templates/market.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'marketView',
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		context:{},
		currentView:null,
		events:{
			"click #regenerate":"onRegenerate",
			"click .market_navButton":"onMarketButton",
			"click .buyItem":"onBuyItem"
		},
		onRegenerate:function(e){
			// var view  = window.localStorage.getItem("quicksilver_save_last_game_marketSubView");
			var view = this.currentView;
			var essence = this.model.get('essence');
			if(this.model.useEssence(this.model.get("market").cost)){
				ajax.send({action:'regenerateMarketView',view:view},function(r){
					// log(r);
					if(r.success){
						// this.model.attributes.market[view.toLowerCase()];
						log(r.market);
						this.model.set('market',r.market);
						this.loadSubView(view);
					}
				},this);
			}else{
				this.outOfEssence();
			}

			AudioManager.play('tick');
		},
		onMarketButton:function(e){
			var el= $(e.currentTarget);
			var target = el.text().toLowerCase();
			this.loadSubView(target);

			AudioManager.play('tick');
		},
		onBuyItem:function(e){
			var el = $(e.currentTarget);
			var item = this.context[parseInt(el.attr('_data'))];
			this.buyItem(item);

			AudioManager.play('tick');
		},
		buyItem:function(item){
			
			// var doBuy = window.confirm("Would you like to buy " + itemToBuy.name + " for " + itemToBuy.price + " gold?");
			this.confirm("Purchase Item","Would you like to buy " + item.title + " for " + item.price + " " + item.currency + "?",item.className,function(doBuy){
				if(doBuy){
					var params = {}
					params['action'] = 'buyItem';
					params['type'] = item.market_type;
					params['index'] = item.index;
					// log(item.index);
					ajax.send(params,function(r){
						// log(r);
						if(r.success){
							AnimationManager.blit("Success");
							AudioManager.play('buy_item');
							if(item.type == 'mount'){
								this.model.set('mount',item);
							}

							if(item.currency == 'gold'){
								this.model.useGold(item.price)
							}else if(item.currency == 'essence'){
								this.model.useEssence(item.price);
							}

							this.model.set('market',r.market);
							var view  = window.localStorage.getItem("quicksilver_save_last_game_marketSubView");
							this.loadSubView(view);

							// append new item to inventory
							if(r.item.market_type != 'mount'){
								this.model.addInventoryItem(r.item);
							}

						}else{
							alert(r.error);
						}
					}.bind(this));
				}else{
					log("not buying");
				}
			}.bind(this));
		},
		
		loadLastView:function(){
			var lastView = window.localStorage.getItem("quicksilver_save_last_game_marketSubView");
			if(lastView){
				this.loadSubView(lastView);
			}else{
				_.defer(function(){
					this.loadSubView('character');
				}.bind(this));
			}
		},
		loadSubView:function(view){

			// render context based on view
			this.context = this.model.get("market")[view.toLowerCase()];
			this.render();

			_.defer(function(){
				$(".market_navButton").removeClass("buttonDown");
				var elem = _.find($(".market_navButton"),function(el){
					return $(el).text().toLowerCase() == view.toLowerCase();
				});
				$(elem).addClass('buttonDown'); 
				$("#marketRegenCost").text(this.model.get("market").cost);
			}.bind(this));

			// window.localStorage.setItem('quicksilver_save_last_game_marketSubView',view);
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			// this.loadLastView();

		},
		render:function(params){
			// log(params);
			this.$el.html(this.template(this.context));
			_.defer(function(){
				if(params && params['subView']){
					var view = params.subView;

					// if(view =='potions')view = 'potion';
					if(view == 'mounts')view = 'mount';
					else if(view =='equipment')view = 'character';
					this.currentView = view;
					this.loadSubView(view);
					this.delegateEvents();
				}
				
			}.bind(this));
			return this;
		}
	});
});