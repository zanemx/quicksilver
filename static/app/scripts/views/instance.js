define(['backbone','handlebars','text!templates/instance.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:"instanceView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		context:{},
		animStops:[],
		battleData:null,
		battleIndex:0,
		events:{
			'click #instanceViewBack':'onBack',
			'click #instanceViewStep':'doStep'
		},
		doStep:function(){
			if(!Backbone.Model.instances.toon.useEnergy(1)){
				this.outOfEnergy();
				return;
			}
			ajax.send({action:'stepDungeon',name:this.context.name},this.onStep,this);
			$("#instanceView button").hide();
		},
		onStep:function(r){
			log(r);
			this.context = r.view;
			this.context.mob = r.view.progression[r.view.progression_index];
			// this.render();
			this.battleData = r;
			this.doTurn();
		},
		onBack:function(){
			this.remove();
			$("#instanceViewContainer").css("display","none");
		},
		init:function(dungeon){
			this.context = dungeon;

			// get or set / get my instance progress for this dungeon
			ajax.send({action:'getDungeon',name:dungeon.name},function(r){
				
				this.context = r.view;
				this.context.party = r.party;
				this.context.mob = dungeon.progression[r.view.progression_index];

				var k = 0;
				for(var i = 0; i < dungeon.progression.length;i++){
					this.animStops.push(k*-1);
					k+=116;
				}

				this.render();

				var progress = r.view.progression_index / dungeon.progression.length * 100;
				$("#dungeonProgressFill").width(String(progress) + '%');
				if(progress >99){
					log('dungeon complete');
					$("#instanceView #instanceViewBack").show();
					$("#instanceView #instanceViewStep").hide();
					$("#instanceViewComplete").css('display','block').show();
				}else{
					$("#heroLifeBar").width('100%');
					$("#mobLifeBar").width('100%');
				}
			},this);
		},
		scrollToMonster:function(){
			$(".monstersContainerInner").css('top',this.animStops[this.context.progression_index]);
			this.updateMobStats();
		},
		updateMobStats:function(){
			if(!this.context.mob)return;
			
			$("#mobName").text(this.context.mob.name).css("color",qsutils.colorByGrade(this.context.mob.grade));
		},
		updateDungeonProgress:function(){


			var progress = this.context.progression_index / this.animStops.length * 100;
			$("#dungeonProgressFill").width(String(progress) + '%');
			if(progress >99){
				$("#instanceViewComplete").css('display','block');
			}else{
				$("#instanceView #instanceViewBack").show();
				$("#instanceView #instanceViewStep").show();
				$("#heroLifeBar").width('100%');
				$("#mobLifeBar").width('100%');
			}


			// update model 
			//find dungeon

			var m = Backbone.Model.instances.toon.get("dungeons");
			var dungeon = _.find(m.active_dungeons,function(d){
				return d.name == this.context.name;
			}.bind(this));
			if(dungeon){
				dungeon['progress'] = this.context['progress'];
				// Backbone.Model.instances.toon.trigger("change:dungeon");
				log("updating dungeon progress");
			}
		},

		set_hp:function(el,fighter){
			// log(fighter);
			var hp = fighter.hp;
			var pcent = fighter.hp / fighter.max_hp * 100;
			var color = 'red'
			if (pcent >10)color = 'yellow';
			if (pcent >30)color = 'green';

			el.text(Math.max(hp,0)).css('color',color);
		},
		doTurn:function(){

			var battleLot = this.battleData.battle.turns;
			if(this.battleIndex < battleLot.length){
				var battle = battleLot[this.battleIndex];

				this.meFrame = $(".hero");
				this.mobFrame = $(".mob");



				var me_hp = Math.max(0,battle.me.hp / battle.me.max_hp) * 100;
				var mob_hp = Math.max(0,battle.mob.hp / battle.mob.max_hp) * 100;
				$("#instanceView #heroLifeBar").width(String(me_hp) + '%');
				$("#instanceView #mobLifeBar").width(String(mob_hp) + '%');

				this.set_hp($("#hero_hp"),battle.me);
				this.set_hp($("#mob_hp"),battle.mob);

				var pos;
				if(battle.attacker == battle.me.name){
					pos = Point.fromElem(this.mobFrame);
				}else{
					pos = Point.fromElem(this.meFrame);
				}

				if(battle.crit)
					AudioManager.play('MeleeHit');
				else
					AudioManager.play('Sword_scrape');

				// pos = Point.add(pos,Point.make(50,50));
				if(battle.crit){
					AnimationManager.blit('crit ' + Math.round(battle.damage),'yellow',pos,null,'1em');
				}else{
					AnimationManager.blit(Math.round(battle.damage),'red',pos);	
				}
				

				this.battleIndex++;
				_.delay(this.doTurn.bind(this),1000);
			}else{
				this.onComplete();
			}
		},
		onComplete:function(){

			Backbone.Model.instances.toon.tickBuffs();

			if(this.battleData.battle.winner == Backbone.Model.instances.toon.get("name")){
				AnimationManager.blit('YOU WIN!',"lime");
				AudioManager.play('Victory')
			}else{
				AnimationManager.blit('you lose!',"red");
				AudioManager.play('lose');
			}

			var rewards = this.battleData.battle.rewards;
			Backbone.Model.instances.toon.addGold(rewards.gold);
			Backbone.Model.instances.toon.addExp(rewards.exp);

			for(var i=0; i < rewards.items.length;i++){
				var reward = rewards.items[i];
				Backbone.Model.instances.toon.addInventoryItem(reward,true,this);
			}

			this.battleIndex = 0;


			// move to next moster
			_.delay(function(){
				$(".hero").find('.lifeMeter')
					.css('-webkit-transform','scale(1,0)')
					.css('-moz-transform','scale(1,0)')
					.css('-o-transform','scale(1,0)')
					.css('transform','scale(1,0)');
				$(".mob").find('.lifeMeter')
					.css('-webkit-transform','scale(1,0)')
					.css('-moz-transform','scale(1,0)')
					.css('-o-transform','scale(1,0)')
					.css('transform','scale(1,0)');
				this.scrollToMonster();
				this.updateDungeonProgress();
			}.bind(this),1000);

			// Backbone.Model.instances.toon.trigger('change:dungeons');
		},
		initialize:function(){
			// Backbone.Model.instances.toon = Backbone.Model.instances.toon;
			
		},
		render:function(){
			this.$el.html(this.template(this.context));
			_.defer(function(){
				this.delegateEvents();
				this.scrollToMonster();
			}.bind(this));
			return this;
		},
	});
});