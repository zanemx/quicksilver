define(['backbone','handlebars','text!templates/duel.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'duelView',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		context:{},
		events:{
			"click .doBattleBtn":"onDoBattle"
		},
		onDoBattle:function(e){
			var target =$(e.currentTarget).attr('name');
			ajax.send({action:'doBattle',enemy:target,toonName:this.model.get('name')},function(r){
				log(r);
				if(r.winner == this.model.get("name")){
					alert('you win!');
				}else{
					alert("you lose");
				}
				this.render();
			}.bind(this));
		},
		initialize:function(){

			var params = {
				action:'getDuelPartners',
				toonName:this.model.get("name")
			}
			ajax.send(params,function(r){
				this.context = r.content;
				this.render();
			}.bind(this));
			this.render();
		},
		render:function(){
			this.$el.html(this.template(this.context));
			this.delegateEvents();
			return this;
		}
	});
});