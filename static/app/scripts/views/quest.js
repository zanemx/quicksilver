define(['backbone','handlebars','text!templates/quest.hbs','models/quest','collections/quest','ajax'],function(Backbone,Handlebars,template,QuestModel,QuestCollection,ajax){
	return Backbone.View.extend({
		id:'questView',
		className:'grid-100 tablet-grid-100 mobile-grid-100',
		template:Handlebars.compile(template),
		cardsFaceUp:false,
		events:{
			'click .questViewDoQuest':'onDoQuest',
			'click #cardViewBack':'onBack',
			'click #cardViewContinue':'onContinue',
			'click .questViewDoFinish':'onDoFinish'
		},

		onContinue:function(){
			// this.$el.remove();
			
			this.getView();
		},

		getView:function(){
			ajax.send({action:'getMapView',view:this.model.get('mapview')},function(r){
				
				if(r.map.currentQuest){
					this.context = r.map.currentQuest;
					this.render();	
				}else{
					this.model.trigger('change:mapview');
				}
				
				
				// _.defer(function(){
				// 	if(this.context.battle){
				// 		if(!$("#battleView")[0])
				// 			var bv = new BattleView(this.context);
				// 	}
				// }.bind(this));

			}.bind(this));
		},

		onBack:function(){
			this.$el.remove();
		},
		onInit:function(context){

		},
		initialize:function(context){
			this.context = context;
			this.model = Backbone.Model.instances.toon;
			this.render();
		},
		render:function(){
			var quest = this.context;
			this.$el.html(this.template(quest));
			this.$el.css('top',$("#statsView").height());
			this.updateProgressBar(quest.percentDone);
			// this.cardsFaceUp=true;
		},

		onDoQuest:function(e){

			var quest = this.context;

			this.toggleDoQuest();

			$(".flip-container").removeClass("flip");

			// UPDATE CLIENT FIRST
			if(!this.model.useEnergy()){
				this.outOfEnergy();
				return;
			}
			var params = {
				action:'doQuest',
				id:quest.name
			}
			ajax.send(params,function(r){

				log(r);
				if(r.item){
					this.createLootFrame(r.item);
					vent.trigger("update_inventory");
				}

				var roll = r.roll;
				var i = 0;
				var elems = $(".questCard > span");
				var flipCons = $(".flip-container");
				var value;
				for(var key in roll){
					if(roll[key].length){
						for(var j=0; j<roll[key].length;j++){
							var flipCon = $(flipCons[i]);
							value = roll[key][j]
							var elem = $(elems[i]);
							elem.removeClass().addClass('qsicons ' + key);
							i++;

							setTimeout(function(_elem,_key,_value,i,flipCon){
								var pos = Point.fromElem(_elem);
								pos = Point.sub(pos,Point.make(0,48));
								AnimationManager.blit("+" +_value+" " + _key,qsutils.colorByRewardType(_key),pos);

								if(!flipCon.hasClass("flip"))
									flipCon.toggleClass("flip");

								if(i==3){
									if(!quest.complete)
										this.toggleDoQuest();
								}
							}.bind(this),i*500,elem,key,value,i,flipCon);
							
							this.model.increment(key,value);
						}	
					}
				}

				this.updateProgressBar(r.percentDone);

				if(r.complete){
					this.onFinish();
				}

				// update user model
				this.model.update(r.toon);

			}.bind(this));
		},
		onFinish:function(){

			$("#questProgressComplete").show();
			$("#questProgressOutter").hide();
			$(".questViewDoFinish").show();
			$(".questViewDoQuest").hide();
		},

		onDoFinish:function(e){
			var quest = this.context;
			if(!quest)return;

			$(".questViewDoFinish").hide();

			// $(".mapViewDoFinish, #cardViewBack").hide();
			$("#cardViewContinue").show();

			// this.$el.hide();

			ajax.send({'action':'doFinishQuest',id:quest.name},function(r){
				// log(r);
				var delay = 0;
				if(r.gold){
					delay+= 300;
					AnimationManager.blit("+" + r.gold + " Gold",'yellow');
				}
				
				if(r.energy){
					delay += 300;
					_.delay(function(){
						AnimationManager.blit("+" + r.energy + " Energy",'yellow');	
					}.bind(this),delay);
				}
				if(r.exp){
					delay += 300;
					_.delay(function(){
						AnimationManager.blit("+" + r.exp + " Experience",'lime');
					}.bind(this),delay);
				}

				if(r.essence){
					delay += 300;
					_.delay(function(){
						AnimationManager.blit("+" + r.essence + " Essence",'purple');
					}.bind(this),delay);	
				}

				if(r.rewards.length)
					delay += 1000;
				
				_.delay(function(){

					// TODO display loot
					for(var i=0; i < r.rewards.length;i++){
						var reward = r.rewards[i];
						this.createLootFrame(reward);
					}
					if(r.rewards.length){
						vent.trigger("update_inventory");
					}
				}.bind(this),delay);

				// delay += 300;
				// _.delay(function(){
					// this.getView();
				// }.bind(this),delay);

				// update user model
				this.model.update(r.toon);
					
			}.bind(this));
		},
		updateProgressBar:function(percentDone){
			// log(percentDone);
			var width = Math.min(Math.floor(percentDone),100);
			var pcent = String(width) + "%";
			$("#questProgressInner").css("width",pcent);
			$("#questProgressInner > div").text(pcent);
		},
		toggleDoQuest:function(){
			var elem = $("#doQuest");

			// enable button
			if(elem.attr('disabled')){
				elem.removeAttr('disabled').fadeTo(300,1);
			}else{
				elem.attr('disabled','disabled').fadeTo(1,0.5);
			}
		},
	});
});