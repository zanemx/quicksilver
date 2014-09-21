define(['backbone','text!templates/talent.hbs','handlebars','ajax'],function(Backbone,template,Handlebars,ajax){
	return Backbone.View.extend({
		id:'talentView',
		template:Handlebars.compile(template),
		events:{
		
		},
		getTalents:function(){
			ajax.send({action:'getTalents'},function(r){
				log(r);
				this.context = r.trees;
				this.render();
			}.bind(this));
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.getTalents();
		},
		render:function(){
			if(!this.context)return this;
			this.$el.html(this.template(this.context));
			this.delegateEvents();
			return this;
		}
	})
});