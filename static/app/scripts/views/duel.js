define(['backbone','handlebars','text!templates/duel.hbs','ajax','views/battle'],function(Backbone,Handlebars,template,ajax,BattleView){
	return Backbone.View.extend({
		id:'duelView',
		className:'grid-100 tablet-grid-100 mobile-grid-100 grid-parent',
		template:Handlebars.compile(template),
		events:{
			'click .doBattleButton':'onDoBattle'
		},
		onDoBattle:function(e){

			if(!this.model.useEnergy()){
				this.outOfEnergy();
				return;
			}

			var el = $(e.currentTarget);
			var keyid = el.attr('_id');

			var params = {
				action:'doDuel',
				enemy_keyid:keyid
			}
			ajax.send(params,function(r){
				if(!r.success){
					this.outOfEnergy();
					return;
				}
				log(r);
				var bv = new BattleView(r,r);
			}.bind(this));
		},
		getBattleList:function(){
			ajax.send({action:'getBattleList'},function(r){
				this.$el.html(this.template(r.content));
			}.bind(this));
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.getBattleList();
		},
		render:function(){

			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});