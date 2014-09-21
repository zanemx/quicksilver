define([
	'backbone',
	'handlebars',
	'text!templates/character.hbs',
	'views/attributes',
	'views/gear',
	'views/inventory',
	'views/talent',
	'models/inventory'
	],function(
		Backbone,
		Handlebars,
		template,
		AttributesView,
		GearView,
		InventoryView,
		TalentView,
		InventoryModel
	){
	return Backbone.View.extend({
		id:'characterView',
		className:'grid-100 tablet-grid-100 mobile-grid-100 grid-parent',
		views:{},
		template:Handlebars.compile(template),

		events:{
			"click .character_navButton":"onNavClick"
		},

		onNavClick:function(e){
			var target= $(e.currentTarget).text().toLowerCase();
			this.loadSubView(target);
			AudioManager.play('tick');
		},
		loadSubView:function(view){
			if(!this.views[view])
				this.cacheSubView(view);

			// set button down state
			$(".character_navButton").removeClass("buttonDown");
			var elem = _.find($(".character_navButton"),function(el){
				return $(el).text().toLowerCase() == view.toLowerCase(); 
			})
			$(elem).addClass('buttonDown');

			$("#characterSubView").html(this.views[view].render().el);
			this.views[view].onload();

			window.localStorage.setItem('quicksilver_save_last_characterSubView',view);
		},
		cacheSubView:function(view){
			switch(view){
				case 'attributes': this.addSubView('attributes',new AttributesView);break;
				case 'gear':this.addSubView('gear',new GearView);break;
				case 'inventory':this.addSubView('inventory',new InventoryView);break;
				case 'talents':this.addSubView('talents',new TalentView);break;
			}
		},
		addSubView:function(key,value){
			this.views[key] = value;
		},
		loadLastView:function(){
			var lastView = window.localStorage.getItem("quicksilver_save_last_characterSubView");
			if(lastView)
				this.loadSubView(lastView);
			else
				this.loadSubView('gear');
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.views = {}

			this.model.on('change:spec',function(){
				$("#characterView .spec").text(this.model.get("spec"));
			}.bind(this));
		},
		render:function(){
			this.$el.html(this.template(this.model.toJSON()));

			_.defer(function(){
				// this.loadLastView();
				// this.loadSubView('gear');
				this.delegateEvents();
			}.bind(this));
			
			return this;
		}
	});
});