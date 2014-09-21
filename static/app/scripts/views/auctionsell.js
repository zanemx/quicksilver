define(['backbone','handlebars','text!templates/auctionsell.hbs'],function(Backbone,Handlebars,template){
	return Backbone.View.extend({
		id:'auctionsellView',
		className:'mobile-grid-100 tablet-grid-100 grid-100	grid-parent',
		template:Handlebars.compile(template),

		events:{
			'click .sellResource':'onSell',
			'click #auctionSellReload':'onReload',
		},

		onReload:function(){
			if($("#auctionSellReload").hasClass('disabled'))return;
			Backbone.Model.instances.toon.getAuctionHouse();
			$("#auctionSellReload").addClass('disabled');
			window.setTimeout(function(){
				$("#auctionSellReload").removeClass('disabled');
			},4000);
		},

		onSell:function(e){
			var el = $(e.currentTarget);
			Backbone.Model.instances.toon.sellResource(el.attr('_id'));
		},	

		initialize:function(){
			Backbone.Model.instances.toon.getAuctionHouse();
			Backbone.Model.instances.toon.on('change:profession change:resources change:recipes change:auctionHouse',this.render.bind(this));
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