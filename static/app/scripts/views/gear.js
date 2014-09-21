define(['backbone','handlebars','text!templates/gear.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:'gearView',
		className:'mobile-grid-100 tablet-grid-100 grid-100',
		template:Handlebars.compile(template),
		selectedItem:null,
		events:{
			"click .gearImageContainer":"onSelectGear",
			"click #gearViewRemoveItem":"onRemoveItem"
		},
		onRemoveItem:function(){
			if(this.selectedItem){
				this.model.removeGearItem(this.selectedItem);
			}
		},
		onSelectGear:function(e){
			var el = $(e.currentTarget);
			var id = el.attr('_id');
			
			if(id == 'mount'){
				this.selectedItem = this.model.get("mount");
			}else{
				this.selectedItem = _.find(this.model.get("gear"),function(_item){
					if(_item)
						return _item.className == id;
				});	
			}
			

			this.render();

			var elems = $(".gearImageContainer");
			for (var i=0; i < elems.length;i++){
				var elem = $(elems[i]);
				if(elem.attr('_id') == id){
					elem.addClass('iconSelected');
				}
			}

			// _.defer(function(){
			// 	$(".gearImageContainer").removeClass("gearItemSelected");
			// 	el.addClass('gearItemSelected');

			// 	log(el);
			// });
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.model.on('change:gear',this.render.bind(this));
		},
		render:function(){
			var context = this.model.toJSON();
			if(this.selectedItem){
				context['selectedItem'] = this.selectedItem;
			}
			this.$el.html(this.template(context));
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		},
	});
});