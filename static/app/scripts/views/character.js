define([
	'backbone',
	'handlebars',
	'text!templates/character.hbs',
	'knockout',
	'views/attributes',
	'views/gear',
	'views/inventory',
	'models/inventory'
	],function(
		Backbone,
		Handlebars,
		template,
		ko,
		AttributesView,
		GearView,
		InventoryView,
		InventoryModel
	){
	return Backbone.View.extend({
		id:'characterView',
		className:'mobile-grid-100',
		views:{},
		template:Handlebars.compile(template),

		events:{
			"click .character_navButton":"onNavClick"
		},

		onNavClick:function(e){
			var target= $(e.currentTarget).text().toLowerCase();
			this.loadSubView(target);
		},
		loadSubView:function(view){
			if(!this.views[view])
				this.cacheSubView(view);
			$("#characterSubView").html(this.views[view].el);
		},
		cacheSubView:function(view){
			switch(view){
				case 'attributes': this.addSubView('attributes',new AttributesView({model:this.model}));break;
				case 'gear':this.addSubView('gear',new GearView);break;
				case 'inventory':this.addSubView('inventory',new InventoryView({model:this.model}));break;
			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		initialize:function(){
			
			this.views = {}
			this.$el.html(this.template({}));
			this.render();
		},
		render:function(){
			this.delegateEvents();
			return this;
		}
	});
});