define(['backbone','handlebars','text!templates/quest.hbs','models/quest','collections/quest'],function(Backbone,Handlebars,template,QuestModel,QuestCollection){
	return Backbone.View.extend({
		id:'questView',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		events:{
			"click #doQuest":"onDoQuest"
		},
		onDoQuest:function(e){
			var target = $(e.currentTarget);
			var id = target.attr('data');
			model = this.collection.get(id);
			model.save();
			// model.save(null,{
			// 	success:function(){
			// 		this.render();
			// 	}.bind(this)
			// })
			// log(this.collection.get(id));

		},
		initialize:function(model,extras){
			var mCharacter = extras.mCharacter.toJSON();
			var cQuest = new QuestCollection;
			cQuest.fetch({
				data:{
					toonName:mCharacter['name']
				},
				success:function(collection){
					this.collection = collection;
					this.collection.on("change",function(){
						this.render();
						vent.trigger("user_model_change");
					},this);
					this.render();

				}.bind(this)
			});
		},
		render:function(){
			if(!this.collection)return this;
			var context = this.collection.toJSON();
			this.$el.html(this.template(context));
			this.delegateEvents();
			return this;
		}
	});
});