define(['backbone','ajax','text!templates/match2game.hbs','handlebars'],function(Backbone,ajax,template,Handlebars){

	return Backbone.View.extend({
		id:'match2gameView',
		template:Handlebars.compile(template),
		context:[],
		firstCard:null,
		secondCard:null,
		icons:[],
		events:{
			'click .grid-icon':'onIconClick',
			'click #back':'onBack'
		},
		onBack:function(){
			$("#mapView .npcGreeting").show();
			$("#mapViewQuestView").empty();
			$("#mapViewQuestView").toggleClass('invisible');
			this.remove();
		},
		onIconClick:function(e){

			if(this.model.get('energy')<=0){
				this.outOfEnergy();
				return;
			}

			

			var el = $(e.currentTarget);
			var first = this.firstCard;
			var second = this.secondCard;
			var matched = false;
			if(!first){
				first = el; 
				first.toggleClass('no-events');
				this.flipCard(el);
			}else if(!second){

				

				second = el;

				// disable the rest 
				first.toggleClass('no-events');
				$(".grid-icon").toggleClass('no-events');
				this.flipCard(el);

				// check for match
				// log(first.find('.icon-front').attr('class') + ' : ' +  second.find('.icon-front').attr('class'));
				var firstIndex = first.data().index;
				var secondIndex = second.data().index;

				if(first.find('.icon-front').attr('class') == second.find('.icon-front').attr('class')){
					first.addClass('matched');
					second.addClass('matched');
					matched=true;

					// update client state
					this.model.get("view").map.currentQuest.match2grid[firstIndex]['matched'] = true;
					this.model.get("view").map.currentQuest.match2grid[secondIndex]['matched'] = true;

					this.checkComplete();
				}else{
					if(!this.model.useEnergy(1)){
						this.outOfEnergy();
						return;
					}
				}


				// hit server to check for match
				ajax.send({action:'doMatch2Quest',first:firstIndex,second:secondIndex},function(r){
					
					if(r.success){
						if(r.reward){
							if(r.reward.rewardKey == 'gold'){
								this.model.addGold(r.reward.value);
							}else if(r.reward.rewardKey == 'energy'){
								this.model.addEnergy(r.reward.value);
							}else if (r.reward.rewardKey == 'essence'){
								this.model.addEssence(r.reward.value);
							}else if(r.reward.rewardKey == 'exp'){
								this.model.addExp(r.reward.value);
							}else{
								this.createLootFrame(r.reward.item);
								this.model.addInventoryItem(r.reward.item);
							}
						}
					}
				},this,true);


				_.delay(function(){
					if(!matched){
						this.flipCard(first);
						this.flipCard(second);	
					}
					
					$(".grid-icon").toggleClass('no-events');
					this.delegateEvents();
					this.firstCard = this.secondCard = null;
				}.bind(this),500);
			}

			this.firstCard = first;
			this.secondCard = second;
		},
		flipCard:function(el){

			if(el.hasClass('matched'))return;

			var front = el.find('.icon-front');
			var back = el.find('.icon-back');
			el.toggleClass('flip');
			_.delay(function(){
				front.toggle();
				back.toggle();
				el.toggleClass('flip');
			}.bind(this),100);
		},
		checkComplete:function(){
			if($(".grid-icon:not(.matched)").length == 0){

				AnimationManager.blit("Quest Complete",'lime',null,'Victory');

				// _.each($(".grid-icon"),function(icon){
				// 	icon = $(icon);
				// 	icon.toggleClass('matched');
				// 	this.flipCard($(icon));
				// }.bind(this));
				_.delay(function(){
					ajax.send({action:'doFinishMatch2Quest'},function(r){
						// log(r);
						if(!r.view.currentQuest){
							this.onBack();
							this.model.trigger('change:mapview');
						}else{
							// load next quest
							// get view from server and update model 
							ajax.send({action:'getMapView',view:this.model.get('mapview')},function(r){
								this.model.set('view',r);
								this.initialize();
							},this);
						}
					}.bind(this));
				}.bind(this),1000);
			}
		},
		initialize:function(){
			this.render();
			_.delay(this.createGrid.bind(this),300);
		},
		render:function(){
			this.model = Backbone.Model.instances.toon;
			this.context = this.model.get('view').map;
			log(this.context);
			this.$el.html(this.template(this.context.currentQuest));
			// $(document.body).html(this.el);

			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
		},
		createGrid:function(){
			var quest = this.context.currentQuest;
			log(quest);
			var con = $("#gridContainer");
			con.empty();
			var padding = 4;
			var k = 0;
			for(var i = 0;i < 4;i++){
				for(var j = 0; j < 4;j++){

					var key = quest.match2grid[k];

					var icon = $(document.createElement('div'));
					icon.data(key);
					

					icon.addClass('grid-icon cursor');
					icon.offset({
						'left':i*(48+padding),
						'top':j*(48+padding)
					});

					var back = $(document.createElement('span')).addClass('icon-back qsicons qsfbicon_50x50').appendTo(icon);
					var front = $(document.createElement('span')).addClass('icon-front qsicons ' + key['rewardKey']).appendTo(icon);

					con.append(icon);

					if(key.matched){
						icon.addClass('matched');
						back.toggle();
						front.toggle();
					}

					k++;
				}
			}
			this.icons = [];
			_.each($(".grid-icon"),function(icon){
				this.icons.push($(icon));
			}.bind(this));

			// center grid
			var w = (i*48) + (i*padding);
			con.css('width',w);

			$(".icon-front").toggle();

			this.checkComplete();

			//0 matches / show cards for a second
			// if($(".grid-icon:not(.matched)").length == 16){

			// 	for(var i = 0; i < this.icons.length;i++){
			// 		_.delay(function(icons,i){
			// 			this.flipCard(icons[i]);
			// 		}.bind(this),i*32,this.icons,i);
			// 	}

			// 	_.delay(function(){
			// 		_.each(this.icons,function(icon){
			// 			this.flipCard(icon);
			// 		}.bind(this));
			// 	}.bind(this),3000);
					
			// }
		}
	});
});
