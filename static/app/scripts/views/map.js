define(['backbone','text!templates/map.hbs','handlebars','ajax','views/battle','views/quest','views/match2game'],function(Backbone,template,Handlebars,ajax,BattleView,QuestView,Match2Game){
	return Backbone.View.extend({
		cardsFaceUp:false,
		id:'mapView',
		template:Handlebars.compile(template),
		events:{
			'click .mapExit':'onExit',
			'click #doStart':'onDoStart',
			'click #mapBack':'onMapBack',
			'click #mapViewExplore':'doExplore',
			// 'click .chainName':'onChainNameClick',
			'click #doFinishChain':'onFinishChain'
		},
		onFinishChain:function(){
			ajax.send({action:'doFinishChain'},this.getView,this);
		},
		onChainNameClick:function(e){
			// var el = $(e.currentTarget);
			// var next = el.next();
			// if(next.hasClass('more')){
			// 	next.removeClass('more').fadeIn('medium');
			// }else{
			// 	next.addClass('more').fadeIn('medium');
			// }
		},
		doExplore:function(){
			ajax.send({action:'doExplore'},function(r){
				this.context = r;
				log(r);
				if(!r.success){
					if(r.error == 'out of energy'){
						this.outOfEnergy();
					}
					return;
				}

				this.model.useEnergy();
				this.render();

				_.defer(function(){

					if(this.context.battle){
						if(!$("#battleView")[0])
							var bv = new BattleView(this.context,r);
					}else{
						var content = '';
						// if(r.found)content = "You have discovered " + r.found.name;
						this.exploreDetails("Explore Results",r.result,r.exp,r.gold);

						if(r.exp){
							this.model.addExp(r.exp);
						}
						if(r.gold){
							this.model.addGold(r.gold);
						}

						if(r.gear){
							this.createLootFrame(r.gear);
							this.model.addInventoryItem(r.gear);
						}

						if(r.resource){
							//emulate an inventory item 
							var obj = {
								'className':{'ore':'mining','herbs':'herbalsm',leather:'skinning'}[r.resource[0]],
								'name':{
									'leather':"Leather x"+r.resource[1],
									'ore':"Ore x"+r.resource[1],
									'herbs':"Herbs x"+r.resource[1],
								}[r.resource[0]],
								'color':'yellow',
								'data':r.resource
							}

							this.createLootFrame(obj);
							this.model.addResource(r.resource);
						}
					}
					
				}.bind(this));
			}.bind(this));
		},
		onMapBack:function(e){
			var target = $(e.currentTarget);
			this.model.set('mapview',target.text());
			this.getView();
		},
		onDoStart:function(e){

			$("#mapView .npcGreeting").hide();

			var match2game = new Match2Game();
			$("#mapViewQuestView").empty();
			$("#mapViewQuestView").toggleClass('invisible');
			$("#mapViewQuestView").html(match2game.el);

			// var questView = new QuestView(this.context.map.currentQuest);
			// this.$el.append(questView.el);
		},
		onExit:function(e){
			var target = $(e.currentTarget);
			var view = target.attr("exitName");

			this.model.set('mapview',view);
		},
		getView:function(){
			ajax.send({action:'getMapView',view:this.model.get('mapview')},function(r){

				this.model.set('view',r);
				log("get view map.js")
				log(this.model.get("view"));
				this.context = r;
				
				if(r.map.npc_image){
					AudioManager.play({
						'human_male':'HumanMaleGreeting1',
						'elf_male':'ElfMaleGreeting1',
						'dwarf_male':'DwarfMaleGreeting1',
					}[r.map.npc_image]);
				}

				this.render();
				// log(this.context.battle);
				_.defer(function(){
					if(this.context.battle){
						if(!$("#battleView")[0])
							var bv = new BattleView(this.context);
					}
				}.bind(this));

			}.bind(this));
		},
		initialize:function(){
			log("initialize map view");
			this.model = Backbone.Model.instances.toon;
			this.model.on('change:mapview',this.getView.bind(this));
			this.getView();
			vent.on('resize',this.centerMap);
		},
		centerMap:function(){
			var map = $("#mapView .areaMap");
			var width = window.innerWidth;
			map.offset({
				left:width*0.5 - map.width()*0.5
			});
		},
		render:function(){
			if(!this.context)return this;
			this.$el.html(this.template(this.context));
			_.defer(function(){
				this.centerMap();
				$(".waypoint").show();
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	})
});