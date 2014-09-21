define(['backbone','handlebars','text!templates/news.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:"newsView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		events:{
			'click .alertFrame > button':'onAction'
		},
		onAction:function(e){
			var el = $(e.currentTarget).parent();
			var alertAction = $(e.currentTarget).text().toLowerCase();
			var key = el.attr('_key');
			var alerts = this.model.get('alerts');
			var alert = _.find(alerts,function(a){
				return a.key == key;
			});
			this.model.doAlertAction(alert,alertAction);
		},
		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.model.on('change:alerts',this.render.bind(this));
		},
		render:function(){
			this.$el.html(this.template(this.model.get("alerts")));
			_.defer(function(){
				this.delegateEvents();
			}.bind(this));
			return this;
		}
	});
});