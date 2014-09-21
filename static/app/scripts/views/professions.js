define(['backbone','handlebars','text!templates/professions.hbs'],function(Backbone,Handlebars,template){
	return Backbone.View.extend({
		id:'professionsView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),

		events:{
			'click .learnProfession':'onLearn',
			'click #profession_unlearn':'onUnLearn',
			'click #regenerateRecipes':'onRegen',
			'click .makeItem':'onMake'
		},

		onMake:function(e){
			var el = $(e.currentTarget);
			var index = el.attr('_data');
			// var item = Backbone.Model.instances.toon.get('recipes')['recipes'][index];
			Backbone.Model.instances.toon.craftItem(index,this);
		},

		onRegen:function(){
			Backbone.Model.instances.toon.regenerateRecipes();
		},

		onLearn:function(e){
			var el = $(e.currentTarget);
			var target = el.attr('_id');
			Backbone.Model.instances.toon.setProfession(target);
		},

		onUnLearn:function(){
			Backbone.Model.instances.toon.setProfession(null);
		},

		initialize:function(){
			Backbone.Model.instances.toon.on('change:profession change:resources change:recipes',this.render.bind(this));
		},

		render:function(){
			var ctx = Backbone.Model.instances.toon;

			log("RESOURCE RENDER FIRED");


			this.$el.html(this.template(ctx.toJSON()));
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});