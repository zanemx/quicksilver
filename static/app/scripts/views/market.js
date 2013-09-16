define(['backbone','handlebars','text!templates/market.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'marketView',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		events:{
			"click .marketItemButton":"onMarketItemClick"
		},
		onMarketItemClick:function(e){
			log('click');
			var target = $(e.currentTarget);
			var name = target.attr('name');
			var price = target.attr('price');

			var params = _.find(this.context,function(_item){
				return _item.name == name;
			});

			params['action'] = 'buyInventoryItem';
			params['toonName'] = this.model.get('id');

			ajax.send(params,function(r){
				vent.trigger("user_model_change");
			}.bind(this));
		},
		initialize:function(){
			this.context = [
				{
					name:"Potion of endurance",
					price:10,
					description:"+ 10 endurance for 30 minutes",
					iconUrl:"static/app/images/ui/icons/talent/improved_stamina.png"
				},
				{
					name:"Potion of strength",
					price:10,
					description:"+ 10 strength for 30 minutes",
					iconUrl:"static/app/images/ui/icons/talent/improved_will.png"
				},
				{
					name:"Potion of intelligence",
					price:10,
					description:"+ 10 intelligence for 30 minutes",
					iconUrl:"static/app/images/ui/icons/talent/improved_concentration.png"
				},
				{
					name:"Potion of defense",
					price:10,
					description:"+ 10 defense for 30 minutes",
					iconUrl:"static/app/images/ui/icons/talent/shield.png"
				}
			];

			this.render();
		},
		render:function(){
			this.$el.html(this.template(this.context));
			this.delegateEvents();
			return this;
		}
	});
});