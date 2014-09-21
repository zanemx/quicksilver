define(['backbone','handlebars','text!templates/alert.hbs','collections/alert'],function(Backbone,Handlebars,template,AlertCollection){
	return Backbone.View.extend({
		id:"alertView",
		template:Handlebars.compile(template),
		bannerTimer:null,
		alerts:null,
		alertIndex:0,
		currentAlert:null,
		className:'grid-100 tablet-grid-100 mobile-grid-100 box',
		events:{
			"click .alertMessage":"onClickAlert"
		},
		context:{},
		onClickAlert:function(e){
			// log(this.currentAlert);
			vent.trigger('game_subview','home');
		},
		onTick:function(){
			this.loadNextAlert();
		},
		loadNextAlert:function(){

			if(this.alerts.length>0){

				this.currentAlert = this.alerts[this.alertIndex];

				$("#banner").hide();
				$("#banner")
					.text(this.currentAlert.content)
					.fadeIn('fast');
				if (this.alertIndex == this.alerts.length-1){
					this.alertIndex = 0;
				}else{
					this.alertIndex++;
				}
			}else{
				this.currentAlert =null;
				$("#banner")
					.text("no new alerts");
			}

		},
		onClose:function(){
			window.clearInterval(this.bannerTimer);
		},
		initialize:function(){

			vent.on('user_model_change',function(){
				this.curateAlerts();
			}.bind(this));

			// START TIMER
			this.bannerTimer = setInterval(this.onTick.bind(this),7000);

			this.render();
			this.curateAlerts();
			this.loadNextAlert();
		},

		curateAlerts:function(){
			var alerts = Backbone.Model.instances.toon.attributes.alerts;
			var _alerts = {}
			_.each(alerts,function(alert){
				_alerts[alert.content] = alert;
			});
			this.alerts = _.flatten(_alerts);

		},
		render:function(){
			this.$el.html(this.template(this.context));
			return this;
		}
	});
});