define(['backbone','handlebars','text!templates/questmaker.hbs','models/questmaker'],function(Backbone,Handlebars,template,QuestMakerModel){
	return Backbone.View.extend({
		id:'questMakerView',
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		selectedChain:null,
		selectedQuest:null,
		currentView:'#questsView',
		events:{
			'click nav>div>button':'onNavClick',
			'click #chainSubmit':'chainSubmit',
			'click #submitQuest':'questSubmit',
			'change #chainSelect':'loadChainView',
			'change #questSelect':'loadQuestView',
			'change #chainKeyName':'onChainKeyNameChange',
			'click .clickableQuest':'onclickableQuest',
			'click .clickableChain':'onclickableChain',
			'click #deleteQuest':'onDeleteQuest',
			'click #deleteChain':'onDeleteChain'
		},
		onDeleteQuest:function(){
			// if(this.selectedQuest){
				var _delete = confirm('are you sure?');
				if(_delete){
					this.model.deleteQuest($('#questName').val());
				}
			// }
			// else{
				// alert("no quest to delete")
			// }
			
		},
		onDeleteChain:function(){
			// if(this.selectedQuest){
				var _delete = confirm('are you sure?');
				if(_delete){
					this.model.deleteChain($('#chainName').val());
				}
			// }
			// else{
				// alert("no chain to delete")
			// }
		},
		onclickableQuest:function(e){
			var el = $(e.currentTarget);
			var target = el.text();
			this.loadQuestView(null,target);
		},
		onclickableChain:function(e){
			var el = $(e.currentTarget);
			var target = el.text();
			this.loadChainView(null,target);	
		},
		hideAllViews:function(){
			$("#chainsView").css("display",'none');
			$("#questsView").css("display",'none');
			$("#overviewView").css("display",'none');
		},
		onNavClick:function(e){

			var el = $(e.currentTarget);
			var target = el.text().toLowerCase();
			this.hideAllViews();
			this.currentView = '#' + target + 'View';
			$(this.currentView).css("display",'block').hide().fadeIn('fast');
			AudioManager.play('tick');
		},
		onChainSelect:function(){

		},
		initialize:function(){
			this.addedOnce = false;
			this.model = new QuestMakerModel;
			this.model.on('onload',this.render,this);
			$(".wrapper").html(this.el);
		},
		render:function(){
			var context = this.model.toJSON();
			context.locations.sort();
			context.selectedChain = this.selectedChain;
			context.selectedQuest = this.selectedQuest;

			this.$el.html(this.template(context));
			this.hideAllViews();
			$(this.currentView).css("display",'block').fadeIn('fast');

			if(this.currentView =='#questsView'){
				var lastChain = window.localStorage.getItem('questMakerView_last_chain');
				if(lastChain){
					$("#chainKeyName").val(lastChain).trigger('change');
					log(lastChain);
					// this.loadQuestView(null,this.selectedQuest.name);
				}
				
			}
			// else if(this.currentView =='#chainsView' && this.selectedChain){
				// this.loadQuestView(null,this.selectedChain.name);
			// }


			
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
		},
		questSubmit:function(){
			this.model.submitQuest();
		},
		chainSubmit:function(){
			this.model.submitChain();
		},
		loadChainView:function(e,id){
			if(!id)id=$(e.currentTarget).val();
			var chain = _.find(this.model.get("chains"),function(chain){
				return chain.name == id;
			});

			if(!chain){
				AnimationManager.blit('cant find chain','red');
				return;
			}
			
			chain.quests = _.sortBy(chain.quests,function(x){return x;});
			chain.locations = _.sortBy(chain.locations,function(x){return x;});
			window.chain = chain;

			var form  = $("#chainsView");
			form.find('#chainName').val(chain.name);
			form.find('#chainStart').val(chain.startDescription);
			form.find('#chainEnd').val(chain.endDescription);
			form.find('#chainNpc').val(chain.location);
			form.find('#dungeonUnlocked').val(chain.dungeon);

			this.selectedChain = chain;
			$("#questsInChain").empty();
			chain.quests = _.sortBy(chain.quests,function(quest){
				return quest.quest_link_id;
			});
			for(var i=0; i < chain.quests.length;i++){
				var q = $(document.createElement('h5')).addClass("cursor clickableQuest").text(chain.quests[i].name);
				$('#questsInChain').append(q);
			}
			this.loadView('#chainsView');
		},
		loadView:function(selector){
			this.hideAllViews();
			this.currentView = selector;
			$(this.currentView).css("display",'block').fadeIn('fast');
		},
		loadQuestView:function(e,id){

			// log('loading quest view');
			
			if(!id)id=$(e.currentTarget).val();
			var quest = _.find(this.model.get('quests'),function(quest){
				return quest.name == id;
			});
			if(!quest){
				AnimationManager.blit('cant find quest','red');
				return;
			}
			log(quest)
			this.selectedQuest = quest;

			var form = $("#questsView");
			form.find("#questName").val(quest.name);
			form.find("#description").val(quest.description);
			form.find("#chainKeyName").val(quest.quest_chain_id);
			form.find("#questAction").val(quest.action);

			window.localStorage.setItem('questMakerView_last_chain',quest.quest_chain_id);

			this.onChainKeyNameChange();
			form.find("#linkSelect").val(quest.quest_link_id);
			this.loadView('#questsView');
		},
		onChainKeyNameChange:function(){
			$("#questsInChain2").empty();
			$('#linkSelect').empty();
			var chain = _.find(this.model.get("chains"),function(chain){
				return chain.name == $("#chainKeyName").val();
			});
			if(chain){

				window.localStorage.setItem('questMakerView_last_chain',chain.name);
				
				chain.quests = _.sortBy(chain.quests,function(quest){
					return quest.quest_link_id;
				});
				$('#linkSelect').empty();
				for(var i=0; i < chain.quests.length;i++){
					$('#linkSelect').append($(document.createElement('option')).val(i+1).text(i+1));
					var q = $(document.createElement('h5')).addClass("cursor clickableQuest").text(chain.quests[i].name);
					$('#questsInChain2').append(q);
				}
				if(i==0){
					$('#linkSelect').append($(document.createElement('option')).val(1).text(1));
				}else{
					$('#linkSelect').append($(document.createElement('option')).val(i+1).text(i+1));
					$('#linkSelect').val(i+1);
				}
			}
		}
	});
});