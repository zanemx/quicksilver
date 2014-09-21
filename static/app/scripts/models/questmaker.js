define(['backbone','ajax'],function(Backbone,ajax){
	return Backbone.Model.extend({
		initialize:function(){
			this.fetch();
		},
		fetch:function(){
			ajax.send({action:'getQuestMakerView'},function(r){	
				this.onFetch(r);
			}.bind(this));
		},
		onFetch:function(r){
			this.set("chains",r.chainQuests);
			this.set("quests",r.quests);
			this.set('locations',r.locations);
			this.set('dungeons',r.dungeons);
			this.trigger('onload');
		},
		reloadPage:function(){
			window.location.reload();
		},
		deleteQuest:function(name){
			ajax.send({action:'deleteQuest',name:name},function(r){
				log(r);
				this.reloadPage();
			}.bind(this));
		},
		deleteChain:function(name){
			ajax.send({action:'deleteChain',name:name},function(r){
				log(r);
				this.reloadPage();
			}.bind(this));
		},
		submitQuest:function(){
			var params = {
				action:'editQuest',
				name:$("#questName").val(),
				description:$("#description").val(),
				quest_chain_id:$("#chainKeyName").val(),
				quest_link_id:$("#linkSelect").val(),
				questAction:$("#questAction").val(),
				questType:$("#questType").val(),
				

			}
			if (params.name == ''){alert("add name");return;}
			if (params.questAction == ''){alert("add quest action");return;}
			if (params.description == ''){alert("add description");return;}
			if (params.quest_chain_id == ''){alert("add chain id");return;}
			if (params.quest_link_id == ''){alert("add link id number");return;}
			if (params.questType == ''){alert("add quest type");return;}
			

			ajax.send(params,function(r){
				AnimationManager.blit('success');
				// this.onFetch(r);
				this.reloadPage();
			}.bind(this));
		},

		submitChain:function(){
			var params = {
				action:'editChain',
				name:$("#chainName").val(),
				start:$("#chainStart").val(),
				end:$('#chainEnd').val(),
				location:$('#chainNpc').val(),
				// dungeon:$("#dungeonUnlocked").val()
			}
			if (params.start == ''){alert("add start description");return;}
			if (params.end == ''){alert("add end description");return;}
			if (params.name == ''){alert("add name");return;}
			// if (params.dungeon == ''){alert("add dungeon");return;}

			ajax.send(params,function(r){
				AnimationManager.blit('success');
				// this.onFetch(r);
				this.reloadPage();
			}.bind(this));

			
		}
	});
});