define(['backbone','handlebars','text!templates/auctionbuy.hbs'],function(Backbone,Handlebars,template){
	return Backbone.View.extend({
		id:'auctionbuyView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),

		events:{
			'click #auctionBuyReload':'onReload',
			'click .buyResource':'onBuy'
		},
		onBuy:function(e){
			var el = $(e.currentTarget);
			Backbone.Model.instances.toon.buyResource(el.attr('_id'));
		},
		onReload:function(){
			if($("#auctionBuyReload").hasClass('disabled'))return;
			Backbone.Model.instances.toon.getAuctionHouse();
			$("#auctionBuyReload").addClass('disabled');
			window.setTimeout(function(){
				$("#auctionBuyReload").removeClass('disabled');
			},4000);
		},

		initialize:function(){
			Backbone.Model.instances.toon.getAuctionHouse();
			Backbone.Model.instances.toon.on('change:auctionHouse',this.render.bind(this));
		},

		render:function(){
			var ctx = Backbone.Model.instances.toon;
			this.$el.html(this.template(ctx.toJSON()));
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});