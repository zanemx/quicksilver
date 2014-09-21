define(['backbone','ajax','utils/channel'],function(Backbone,ajax,Channel){
	
	return Backbone.Model.extend({

		initialize:function(){

			this.channel = new Channel(this);
			this.set('view',{});
			this.set("auctionHouse",{});
			// this.set('dungeon',{});

			this.on('change',this.onChange,this);

			this.on('change:alerts',this.onNewAlert,this);

			this.onNewAlert();

			this.on('change:inventory',function(){
				if(this.get('inventory').length==this.get('inventory_slot_count')){

					AnimationManager.blit('inventory full','red',null);
				}else if(this.get('inventory').length>this.get('inventory_slot_count')){
					AnimationManager.blit('INVENTORY OVERFULL','red',null,null);
				}
			},this);

			this.on('change:gold',function(model,newAmount){
				if(model._previousAttributes.gold < newAmount){
					var diff = newAmount -model._previousAttributes.gold;
					AnimationManager.blit('+' + diff + ' gold', 'yellow',Point.fromElem($("#statsGold")),'buy_item');
				}
			},this);

			this.on('change:exp',function(model,newAmount){
				var diff = newAmount -model._previousAttributes.exp;
				AnimationManager.blit('+' + diff + ' exp', 'lime',Point.fromElem($("#statsExp")),'exp');
			},this);

			this.on('change:essence',function(model,newAmount){
				if(model._previousAttributes.essence < newAmount){
					var diff = newAmount -model._previousAttributes.essence;
					AnimationManager.blit('+' + diff + ' essence', 'purple',Point.fromElem($("#statsEssence")),'exp');
				}
			},this);

			this.on('change:energy',function(model,newAmount){
				var diff = newAmount -model._previousAttributes.energy;
				if(model._previousAttributes.energy < newAmount){
					
					AnimationManager.blit('+' + diff + ' energy', 'white',Point.fromElem($("#statsEnergy")),'exp');
					if(model.get('energy') == model.get("energyMax")){
						AnimationManager.blit("Energy Full!", 'yellow',null,'success');
					}
				}else{
					// AnimationManager.blit('-' + diff + ' energy', 'red',Point.fromElem($("#statsEnergy")));
				}
			},this);

			
			// timer for stamina regen
			if(this.get('name'))
				this.resetTimer();
		},
		tickBuffs:function(){
			var buffs = this.get('buffs');
			for(var i = 0; i < buffs.length;i++){
				var buff = buffs[i];
				if(buff.uses>0){
					buff.uses--;
				}else{
					AnimationManager.blit(buff.name + ' expired');
					buffs.splice(i,1);
				}
			}
			this.set('buffs',buffs);
		},
		resetTimer:function(){
			if(this.timer)
				window.clearTimeout(this.timer);

			var delta = this.get('secondsTillNextEnergy');
			this.timer = window.setTimeout(this.onTimer.bind(this),delta*1000);
		},
		onTimer:function(){
				ajax.send({action:'updateStamina'},function(r){
					// log(r);
					this.set('energy',r.energy);
					this.set('secondsTillNextEnergy',r.secondsTillNextEnergy);

					if(r.secondsTillNextEnergy == 0){
						// wait 2 seconds 
						this.set('secondsTillNextEnergy',this.get('calculated')['replenishRate'] - 2);
						setTimeout(this.resetTimer.bind(this),2000);
					}else{
						this.resetTimer();	
					}
					
				},this,true);
		},
		onChange:function(model){
			
		},
		onNewAlert:function(){
			var alerts = this.get("alerts");
			if(!alerts)return;
			if (alerts.length>0){
				$(".alertSidebar").addClass('showAlertSidebar');
			}else{
				$(".alertSidebar").removeClass('showAlertSidebar');
			}
		},
		onChannelMessage:function(m){
			// log(m);
			switch(m.type){
				case 'level up':
					var t = m.toon;
					this.set('exp',t.exp);
					this.set('exp_to_next_level',t.exp_to_next_level);
					this.set('level',t.level);
					this.set('skillpoints',t.skillpoints);
					this.set('alerts',t.alerts);
					AnimationManager.blit('LEVEL UP! ' + t.level,'lime',null,'Victory');
					AnimationManager.blit('new skillpoint','lime',null,'tick');
					break;

				case "duel":
					var t = m.toon;
					this.set('alerts',t.alerts);
					log(this);
					log('updating alerts');
					break;

			}
		},
		addInventoryItem:function(item,showLootFrame,view){
			if(showLootFrame && view){
				view.createLootFrame(item);
			}
			this.get('inventory').push(item);
			this.trigger('change:inventory');
		},
		removeInventoryItem:function(item){
			var arr = this.get("inventory");
			this.set('inventory',_.filter(arr,function(i){
				return i.id != item.id;
			}));
			// this.trigger('change:inventory');
		},
		addGold:function(x){
			this.set('gold',this.get('gold') + x);
		},
		addExp:function(x){
			this.set('exp',this.get('exp') + x);
		},
		addEssence:function(x){
			this.set('essence',this.get('essence') + x);	
		},
		addEnergy:function(x){
			var n = this.get('energy') + x;
			this.set('energy',Math.min(n,this.get('energyMax')));
		},
		_save:function(attribs,callback){

			// this.save(null,{success:function(model){
			// 	Backbone.Model.instances.toon = model;
			// 	vent.trigger("user_model_change");
			// }});
		},

		// FETCHES ONLY ATTRIBS IN ARRAY. AKA PATCH REQUEST
		_fetch:function(attribs,callback){
			var params = {
				action:'characterFetchAttribs',
				attributes:JSON.stringify(attribs)
			}
			ajax.send(params,callback);
		},

		increment:function(k,v){
			var old = this.get(k);
			var _new = parseInt(old) + parseInt(v);
			this.set(k,_new);
		},
		decrement:function(k,v){
			var old = this.get(k);
			var _new = parseInt(old) - parseInt(v);
			this.set(k,_new);
		},
		useEnergy:function(){
			var energy = parseInt(this.get("energy"));
			if(energy<1){
				return false;
			}
			this.set('energy',energy-1);
			return true;
		},
		useGold:function(amt){
			var gold = parseInt(this.get("gold"));
			var diff = gold-amt;
			if(diff<=0){
				return false;
			}
			this.set('gold',diff);
			return true;
		},
		useEssence:function(amount){
			var essence = parseInt(this.get("essence"));
			var diff = essence - amount;
			if(diff>=0){
				this.set('essence',diff);
				return true;
			}
			return false;
		},
		useSkillPoint:function(attribute){
			attribute = attribute.toLowerCase();
			var skillpoints = parseInt(this.get('skillpoints'));
			if(skillpoints>0){

				var currentValue = parseInt(this.get(attribute));
				var _params = {};
				_params[attribute]=currentValue+1;
				_params['calculated_' + attribute] =currentValue+1;
				_params['skillpoints'] = skillpoints-1;
				this.set(_params);
				
				// server logic
				var params = {
					action:'addSkillPoint',
					attribute:attribute
				}
				ajax.send(params,function(r){
					if(r.success){
						AnimationManager.blit('success');
						AudioManager.play('success');
						this.set('calculated',r.calculated);
					}
						
				}.bind(this));

				return true;
			}
			return false;
		},
		update:function(toon){
			for(var key in toon){
				var attr=this.get(key);
				if(attr != null){
					// log(key + ':' + attr)
					this.set(key,toon[key]);
				}
			}

			// check level up
			if(this.get("didLevelUp")==true){
				vent.trigger('level_up');
				this.toggle_didLevelUp();
			}
		},
		toggle_didLevelUp:function(){
			ajax.send({action:'toggle_didLevelUp'});
		},
		getGear:function(){
			ajax.send({action:'getGear'},function(r){
				this.set('gear',r.gear);
			}.bind(this));
		},
		useItem:function(item){
			var params = item;
			params['action'] = 'useItem';
			ajax.send(params,function(r){
				this.update(r.toon);
			}.bind(this));
		},
		removeGearItem:function(item){
			params = item;
			params['action'] = 'removeEquippedItem';
			ajax.send(params,function(r){
				if(r.success)
					this.update(r.toon);
			}.bind(this));
		},
		doAlertAction:function(alert,alertAction){
			this.set('alerts',_.without(this.get('alerts'),alert));
			ajax.send({action:'doAlertAction',key:alert.key,alertAction:alertAction});
		},
		
		disband:function(name){
			var guilds = this.get("guilds");
			var guild = _.find(guilds,function(g){
				return g.name == name;
			});
			if(!guild){
				alert('cant find guild');
			}

			guild['action'] = 'disbandGuild';
			ajax.send(guild,function(r){
				if(r.success)
					AnimationManager.blit(guild.name + ' is no more.');
				else
					AnimationManager.blit(r.error);
			}.bind(this));

			var newArr = _.without(guilds,guild);
			this.set("guilds",newArr);
		},
		createGuild:function(name){
			var params = {
				action:'createGuild',
				name:name
			}
			ajax.send(params,function(r){
				if(!r.success){
					alert(r.error);
					return;
				}

				this.get('guilds').push(r.guild);
				this.trigger('change:guilds');
			
			}.bind(this));
		},
		getParty:function(){
			ajax.send({action:'getParty'},function(r){
				log(r.party);
				this.set('party',r.party);
			}.bind(this));
		},
		addPartyMember:function(name,oldMember){
			var params = {
				action:'addPartyMember',
				name:name,
				oldMember:oldMember
			}
			ajax.send(params,function(r){
				log(r);
				if(!r.success){
					AnimationManager.blit(r.error);
				}else{
					this.set('party',r.party);
				}
			}.bind(this));
		},
		getAllToonNames:function(){
			var toonNames = this.get("toonNames");
			// if(!toonNames){
				ajax.send({action:'getAllToonNames'},function(r){
					log(r);
					this.set('toonNames',r.names);
				}.bind(this));
			// }else{
				// return this.get("toonNames");
			// }
		},
		setProfession:function(prof){
			ajax.send({action:'setProfession',profession:prof},function(r){
				log(r);
				this.set('profession',prof);
			}.bind(this));
		},
		regenerateRecipes:function(){
			ajax.send({action:'regenerateRecipes'},function(r){
				this.set('recipes',r.recipes);
			}.bind(this));
		},
		addResource:function(resource){
			var r=this.get('resources');
			r[resource[0]] += resource[1];
			this.set('resources',r);
		},
		craftItem:function(index,view){
			ajax.send({
				action:'craftItem',
				index:index
			},function(r){
				if(r.success){
					var item = r.item;
					this.addInventoryItem(item,true,view);
					AnimationManager.blit("SUCCESS", 'yellow',null,'success');

					//update resources
					var res = this.get('resources');
					for(var k in res){
						if(item[k]){
							res[k] -= item[k];
						}
					}
					this.set('resources',res);
					this.trigger('change:resources');
					log("updating resources");

				}else{
					alert(r.error);
				}
			}.bind(this));
		},

		sellResource:function(type){
			ajax.send({action:'sellResource',type:type},function(r){
				if(!r.success){
					alert(r.error);
					return;
				}

				this.set('resources',r.resources);
				this.set('gold',r.gold);

			},this);
		},
		buyResource:function(type){
			ajax.send({action:'buyResource',type:type},function(r){
				if(!r.success){
					alert(r.error);
					return
				}
				this.set('auctionHouse',r.auctionHouse);
				this.set('gold',r.gold);
				this.set('resources',r.resources);
			},this);
		},
		getAuctionHouse:function(){
			ajax.send({action:'getAuction'},function(r){
				log(r);
				if(!r.success){
					alert(r.error);
					return;
				}
				this.set('auctionHouse',r.auctionHouse);
			},this);
		},
		resetDungeon:function(name){
			ajax.send({action:'resetDungeon',name:name},function(r){
				log(r)
				if(!r.success){
					alert(r.error);
					return;
				}
				this.set('dungeons',r);
			},this);
		}
	});
});