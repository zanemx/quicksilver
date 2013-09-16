define(['backbone','handlebars','text!templates/home.hbs','knockout','collections/news'],function(Backbone,Handlebars,template,ko,NewsCollection){
	return Backbone.View.extend({
		id:'homeView',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		initialize:function(){

			// GET NEWS
			var newsCollection = new NewsCollection;
			newsCollection.fetch({
				success:function(collection){
					this.collection = collection;
					this.collection.on("change",this.render,this);
					this.render();
				}.bind(this)
			});
		},
		render:function(){
			if(!this.collection)return this;
			this.$el.empty();
			var context = this.collection.toJSON();
			this.$el.append(this.template(context));
			return this;
		}
	});
});