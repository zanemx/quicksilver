define(['backbone','text!templates/stats.hbs','handlebars'],function(Backbone,template,Handlebars){
	return Backbone.View.extend({

		id:"statsView",
		className:"mobile-grid-100 grid-100 tablet-grid-100 grid-parent",
		events:{
			'click h6':'onStatClick'
		},

		template:Handlebars.compile(template),
		// timer_energy:null,
		time:null,
		syncing:false,
		onStatClick:function(e){
			var el = $(e.currentTarget);
			var t = el.text();
			if(t == 'essence' || t == 'stamina'){
				this.buyPremium();
			}
		},	
		onTick:function(){

			this.updateBuffTimers();

			if(this.syncing)return;
			this.setEnergyTime();
			// if(this.time == 0){
			// 	this.syncing=true;
			// 	this.model._fetch([
			// 		'energy',
			// 		'energyMax',
			// 		'secondsTillNextEnergy'
			// 	],function(r){
			// 		for(var a in r.attribs){
			// 			this.model.set(a,r.attribs[a]);
			// 		}
			// 		this.render();
			// 		this.syncing=false;
			// 	}.bind(this));
			// }
			this.time-=1;
		},

		updateBuffTimers:function(){
			var buffs = Backbone.Model.instances.toon.get("buffs");
			for(var i in buffs){
				var buff = buffs[i];
				buff.timeLeft -=1;
				var minLeft = Math.floor(buff.timeLeft/60);

				// get element for object
				var key = "#statsView ." + buff.className;
				$(key).find('small').text(minLeft + "min")
			}
		},

		setEnergyTime:function(){
			if(this.model.get("energy") == this.model.get("energyMax")){
				$("#nextEnergyIn").text("max");
			}else{
				$("#nextEnergyIn").text('Next in: ' + this.time);
			}
		},

		onClose:function(){
			// window.clearInterval(this.timer_energy);
		},

		initialize:function(){

			this.model = Backbone.Model.instances.toon;
			this.model.on('change',this.render,this);
			vent.on('user_model_change',function(){
				this.render();
				this.syncing=false;
			},this);

			this.model.on('change:energy',function(context){
				$("#statEnergy").text(context);
			}.bind(this));

			vent.on('gold_change',function(totalGold){
				$("#statsView #statsGold").text(totalGold);
			}.bind(this));

			// this.timer_energy = window.setInterval(this.onTick.bind(this),1000);
			this.render();
		},

		render:function(){
			var context = this.model.toJSON();
			this.time = context.secondsTillNextEnergy;
			// log(this.time);
			this.$el.html(this.template(context));
			this.setEnergyTime();
			return this;
		}
	});
});