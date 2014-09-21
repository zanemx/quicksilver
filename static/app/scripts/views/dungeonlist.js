define(['backbone','handlebars','text!templates/dungeonlist.hbs','ajax','views/instance'],function(Backbone,Handlebars,template,ajax,InstanceView){
	return Backbone.View.extend({
		id:"dungeonListView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		context:{},
		instanceView:null,
		events:{
			'click #enterDungeon':'onEnterDungeon',
			'click .setupDungeon':'onSetupDungeon',
			'click #resetDungeon':'onReset'
		},
		onReset:function(e){
			var el = $(e.currentTarget);
			var name = el.attr('_id');
			Backbone.Model.instances.toon.resetDungeon(name);
		},
		onEnterDungeon:function(e){
			var el = $(e.currentTarget);
			var name = el.parent().attr("_name");


			var dungeon = _.find(Backbone.Model.instances.toon.get('dungeons').active_dungeons,function(d){
				return d.name == name;
			});

			if(!this.instanceView){
				this.instanceView = new InstanceView;
			}
			$("#instanceViewContainer").html(this.instanceView.el).css("display",'block');
			this.instanceView.init(dungeon);
		},
		onSetupDungeon:function(e){
			var el = $(e.currentTarget);
			var name = el.parent().attr("_name");
			var difficulty = (el.parent().find('select').val());
			ajax.send({action:'setupDungeon',name:name,difficulty:difficulty},function(r){

				if(r.success){
					Backbone.Model.instances.toon.set('dungeons',r);
					this.render();
				}else{
					AnimationManager.blit(r.error);
				}
			},this);
		},
		getView:function(){
			ajax.send({action:'getDungeonList'},function(r){
				Backbone.Model.instances.toon.set('dungeons',r);
				// this.render();
			},this);
		},
		initialize:function(){
			Backbone.Model.instances.toon.on('change:dungeons',this.render,this);
			this.getView();
		},
		render:function(){
			// log('render dungeon list view');
			var context = Backbone.Model.instances.toon.get('dungeons');
			// log(context);
			if(!context){
				return this;
			}
			// this.context = _.sortBy(this.context,function(dungeon){
				// return dungeon.level;
			// });
			this.$el.html(this.template(context));
			_.defer(this.delegateEvents.bind(this));
			return this;
		},
	});
});