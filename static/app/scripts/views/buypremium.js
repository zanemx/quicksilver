define(['backbone','handlebars','text!templates/buypremium.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'buyPremiumView',
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		selectedItem:null,
		events:{
			'click .premiumOk':'onOk',
			'click .premiumCancel':'onCancel',
			'click .product':'onProductSelect'
		},
		onProductSelect:function(e){
			$(".product").removeClass("productHighlight");
			var el = $(e.currentTarget);
			el.addClass('productHighlight');
			this.selectedItem = el.find('h6:nth(0)').text().toLowerCase();
			log(this.selectedItem);
		},
		onCancel:function(){
			this.remove();
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.render();
		},
		render:function(){
			this.$el.html(this.template({}));
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		},

		onOk:function(){

			log(this.selectedItem);

			//TODO remove on launch

			if(this.selectedItem == 'fill energy'){
				ajax.send({action:'ENERGY_replenish'},function(r){
					if(!r.success){alert(r.error);return;}
					Backbone.Model.instances.toon.set('energy',r.energy);
					this.remove();

				},this);
			}else if(this.selectedItem.search('essence') > -1){
				var amount = this.selectedItem.substr(0,this.selectedItem.indexOf(' '));
				ajax.send({action:'addEssence',amount:amount},function(r){
					if(!r.success){alert(r.error);return;}
					Backbone.Model.instances.toon.set('essence',r.essence);
					this.remove();
				},this);
			}
					

			
			return;

			// if(!this.selectedItem)return;
			if(!window['MocoSpace']){
				return;
			}
			MocoSpace.goldTransaction(50,'Some Nice Quicksilver Stuffs',{
			    onSuccess:function(id,timestamp,token) {
					alert("Item purchased: "+id+", timestamp: "+timestamp+", token: "+token);
			           // send back to your servers here to verify token and credit user
			    },
			    onError:function(reason) {
			    	alert("Error getting item: "+reason);
			    },
			    onAbort:function() {
			    	alert("User abort");
			 	},
			    onAsync:function() {
					alert("Top-up of MocoGold required");
			           // store item in your cart here
			    }
			},"http://www.mitchelaneous.com/wp-content/uploads/2009/01/yellow-coin.png");
		}
	});
});