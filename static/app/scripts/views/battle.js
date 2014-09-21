define(['backbone','handlebars','text!templates/battle.hbs','ajax'],function(Backbone,Handlebars,template,ajax){

	return Backbone.View.extend({
		id:'battleView',
		className:'mobile-grid-100 tablet-grid-100 grid-100',
		battleIndex:0,
		template:Handlebars.compile(template),
		events:{
			'click #battleOk':'onOk'
			// 'click #battleViewBattleAgain':'onBattleAgain'
		},
		onBattleAgain:function(){

			if(!this.model.useEnergy()){
				this.outOfEnergy();
				return;
			}

			var params = {
				action:this.context.__action__
			}

			if(params.action == 'doDuel'){
				params['enemy_keyid'] = this.context.enemy_keyid;
			}

			ajax.send(params,function(r){
				// vent.off('resize',this.resize.bind(this));
				this.initialize(r);
			}.bind(this));
		},
		onOk:function(e){
			if($(e.currentTarget).text().toLowerCase() == 'skip'){
				this.showLoot();
			}
			// vent.off('resize',this.resize.bind(this));
			//COMPLETELY UNBIND THE VIEW
		    this.undelegateEvents();

		    this.$el.removeData().unbind();

		    //Remove view from DOM
		    this.remove();  
		    Backbone.View.prototype.remove.call(this);
		},
		initialize:function(context,r){

			// log(context);

			this.r = r;

			vent.on('resize',this.center.bind(this));

			this.battle = context.battle;

			// log(context);
			if(!context.battleMeta)
				this.battleMeta = {
					me:context.battle.p1,
					mob:context.battle.p2
				}

			//remove any lingering loot frames
			$(".lootFrameClone").remove();
			
			this.battleIndex = 0;
			this.model = Backbone.Model.instances.toon;
			this.context = context;
			// vent.on('resize',this.resize.bind(this));
			this.render();

			this.meFrame = $("#battleView #battleViewMe");
			this.mobFrame = $("#battleView #battleViewMob");

			// this.battleMeta = this.context.battleMeta;
			this.meFrame.find('h4').text(this.battleMeta.me.name);
			this.mobFrame.find('h4').text(this.battleMeta.mob.name).css('color',this.battleMeta.mob.color);
			

			$("#battleViewBattleAgain").hide();

			_.delay(this.doTurn.bind(this),1200);
		},
		
		doTurn:function(){

			// if this view closes, stop logic
			if(!this.$el.parent()[0])return;

			var data = this.context.battle;

			var turns = data.turns;

			if(this.battleIndex < turns.length){
				var turn = turns[this.battleIndex];

				var me = turn.me;
				var mob = turn.mob;

				$("#heroLifeBar").width((me.hp / me.max_hp *100) + '%');
				$("#mobLifeBar").width((mob.hp / mob.max_hp * 100) + '%');

				var pos;
				if(turn.attacker == turn.me.name){
					pos = Point.fromElem($("#heroProgressBar"));
				}else{
					pos = Point.fromElem($("#mobProgressBar"));
				}

				pos = Point.sub(pos,Point.make(0,30));
				// log(turn)
				// AnimationManager.blit(Math.round(turn.damage),'red',pos);
				// pos = Point.add(pos,Point.make(50,50));
				if(turn.crit){
					AnimationManager.blit('crit ' + Math.round(turn.damage),'yellow',pos,null,'1em');
				}else{
					AnimationManager.blit(Math.round(turn.damage),'red',pos);	
				}

				this.battleIndex++;
				_.delay(this.doTurn.bind(this),1000);

				if(turn.crit)
					AudioManager.play('MeleeHit');
				else
					AudioManager.play('Sword_scrape');

				
			}else{
				this.onComplete();
			}
		},
		onComplete:function(){

			this.showLoot();

			$("#battleOk").text("ok");

			if(this.battle.winner == this.battle.p1.name){
				AnimationManager.blit('YOU WIN!',"lime",null,'Victory');
			}else{
				AnimationManager.blit('you lose!',"red",null,"lose");
			}
		},
		showLoot:function(){
			// deffered rewards from map view 

			this.model.tickBuffs();

			if(this.r){
				if(!this.r.result)return;

				var r = this.r;
				var content = '';
				if(r.found)content = "You have discovered " + r.found.name;
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
						'className':{ore:'mining',herbs:'herbalism',leather:'skinning'}[r.resource[0]],
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
		},
		center:function(){
			this.$el.css({
				top:96,
				left:window.innerWidth / 2 - 320/2
			});
		},
		render:function(){

			this.context['toon'] = this.model.toJSON();
			// log(this.context);
			this.$el.html(this.template(this.context.battle));
			this.center();
			$(".animationLayer").append(this.el);
		}
	})
});