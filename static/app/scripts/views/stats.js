define(['backbone','text!templates/stats.hbs','handlebars'],function(Backbone,template,Handlebars){
	return Backbone.View.extend({

		id:"stats",
		className:"mobile-grid-100",

		template:Handlebars.compile(template),
		timer_energy:null,
		time:30,
		onTick:function(){
			this.time-=1;
			if(this.time == -1)
				this.time = 30;
			$("#nextEnergyIn").text(this.time);
		},

		onClose:function(){
			window.clearInterval(this.timer_energy);
		},

		initialize:function(model,extras){
			this.model.on('change',this.render,this);
			vent.on('user_model_change',function(){
				this.model.fetch({
					success:function(model){
						this.model = model;
					}.bind(this)
				});
			},this);

			this.timer_energy = window.setInterval(this.onTick.bind(this),1000);
			
			this.render();
		},

		render:function(){
			var context = this.model.toJSON();
			this.$el.html(this.template(context));
			return this;
		}
	});
});