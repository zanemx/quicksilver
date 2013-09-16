define(['backbone','handlebars','text!templates/inventory.hbs','knockout','models/inventory','ajax'],function(Backbone,Handlebars,template,ko,InventoryModel,ajax){
	return Backbone.View.extend({
		id:'inventoryView',
		className:'mobile-grid-100',
		template:Handlebars.compile(template),
		initialize:function(){
			// var model = new InventoryModel({name:extras.toonName});
			// model.fetch({
			// 	success:function(model){
			// 		this.model = model;
			// 		this.render();
			// 	}.bind(this)
			// });
			var params = {
				action:'getInventory',
				toonName:this.model.get("id")
			}
			ajax.send(params,function(r){
				this.context = r.content;
				this.render();
			}.bind(this));

		},
		render:function(){
			this.$el.html(this.template(this.context));
		}
	});
});
