define(['backbone','handlebars','text!templates/inventory.hbs','models/inventory','ajax'],function(Backbone,Handlebars,template,InventoryModel,ajax){
	return Backbone.View.extend({
		id:'inventoryView',
		className:'grid-100 tablet-grid-100 mobile-grid-100 grid-parent',
		template:Handlebars.compile(template),
		selectedItem:null,
		sorted:false,
		events:{
			"click .inventoryItem":"onItemClick",
			"click #inventorySellButton":"onSellItem",
			"click #inventoryUseButton":"onUseItem",
			"click #inventoryViewSort":"onSort"
		},
		onSort:function(){
			this.sorted = true;
			this.render();
		},
		onUseItem:function(){
			if(!this.selectedItem)return;

			this.selectedItem.el.remove();
			this.selectedItem.el = null;

			// log(this.selectedItem);

			this.deselect();

			this.model.useItem(this.selectedItem);
		},
		onSellItem:function(){
			if(!this.selectedItem)return;

			this.confirm("Sell Item","Would you like to sell " + this.selectedItem.title + "?",this.selectedItem.className,function(yes){
				this.selectedItem.el.remove();
				this.selectedItem.el = null;	
				var params = this.selectedItem;
				params['action'] = 'sellItem';
				ajax.send(params,function(r){
					this.model.set('gold',r.gold);
				}.bind(this));	
			}.bind(this));
			
			this.model.removeInventoryItem(this.selectedItem);
		},

		deselect:function(){
			$("#inventoryView .selectedItem > h6").text('Select an item');
			$("#inventoryView .selectedItem > small").text('');
			$("#inventoryView .inventoryButtons").css("visibility","hidden");
		},

		onItemClick:function(e){

			var target = $(e.currentTarget);
			var name = target.attr("_name");

			if(name == 'null')return;

			var selectedItem = _.find(this.model.get('inventory'),function(item){
				return item.name == name;
			});

			log(selectedItem)

			// this.itemDetailsFrame(selectedItem);

			selectedItem.el = target;
			// log(target);

			$("#inventoryView .inventoryItem > div").removeClass("iconSelected");
			target.find('div').addClass('iconSelected');

			var title = selectedItem.name;// + " ("+(selectedItem.count || '1') + ")";
			$("#inventoryView .selectedItem > h6").text(title).css('color',selectedItem.color);
			$("#inventoryView .selectedItem > small").text(selectedItem.description);
			$("#inventoryView .inventoryButtons").css("visibility","visible");

			// additional stats
			$("#inventoryViewItemStats").empty();
			for(var key in selectedItem){
				var value = selectedItem[key];
				if(key == 'level' || key == 'intelligence' || key == 'endurance' || key == 'strength' || key == 'defense'){
					if(key == 'level'){
						var stat = $(document.createElement('div')).text('Item ' + key + ' ' + value).addClass('stat');
						stat.css("color","orange");
						$("#inventoryViewItemStats").prepend(stat);
					}else{
						var stat = $(document.createElement('div')).text(key + ' ' + value).addClass('stat');
						$("#inventoryViewItemStats").append(stat);
					}
				}
			}

			this.selectedItem= selectedItem;
			this.showCurrentlyEquipped();
		},
		showCurrentlyEquipped:function(){
			var el = $(".current");

			var type = this.selectedItem.type;
			if(type == 'armor')
				type = this.selectedItem.subType;

			var current = this.gear[type];

			var stats = $("#inventoryViewCurrentItemStats");
			stats.empty();

			el.find('small').text('');

			if(!current){
				el.find('h6').eq(1).text('none').css('color','red');
				return;
			}

			var title = current.name;// + " ("+(current.count || '1') + ")";
			el.find('h6').eq(1).text(title).css('color',current.color);
			el.find('small').text(current.description);

			// additional stats
			for(var key in current){
				var value = current[key];
				if(key == 'level' || key == 'intelligence' || key == 'endurance' || key == 'strength' || key == 'defense'){
					if(key == 'level'){
						var stat = $(document.createElement('div')).text('Item ' + key + ' ' + value).addClass('stat');
						stat.css("color","orange");
						stats.prepend(stat);
					}else{
						var stat = $(document.createElement('div')).text(key + ' ' + value).addClass('stat');
						stats.append(stat);
					}
				}
			}
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.gear = this.model.get("gear");
			this.model.on('change:inventory change:gear',function(){
				this.gear = this.model.get("gear");
				this.render();
			}.bind(this));
		},
		
		render:function(){
			this.context = {
				inventory:[],
				overfull:false
			}
			var inventory = this.model.toJSON().inventory;
			var inventory_slot_count = this.model.get("inventory_slot_count");
			if(inventory.length > inventory_slot_count){
				this.context['overfull'] = true;
			}
			for(var i=0; i < inventory_slot_count;i++){
				if(i<inventory.length){
					this.context.inventory.push(inventory[i]);
				}else{
					this.context.inventory.push(null);
				}
			}

			// filter by type
			if(this.sorted){
				this.context.inventory = _.sortBy(this.context.inventory,function(item){
					if(item)
						return item.subType;
				});
			}

			
			this.$el.html(this.template(this.context));
			this.delegateEvents();
			return this;
		}
	});
});
