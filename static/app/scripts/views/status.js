define(['backbone','handlebars','ajax','text!templates/status.hbs'],function(Backbone,Handlebars,ajax,template){
	return Backbone.View.extend({

		id:'statusView',
		template:Handlebars.compile(template),
		events:{
			"click #updateStatusButton":"onUpdateStatus"
		},
		onUpdateStatus:function(){
			var status = $("#status").val();
			var name = Backbone.Model.instances.toon.get('name');

			var params = {
				'action':'updateStatus',
				'toonName':Backbone.Model.instances.toon.get('name'),
				'status':status
			}
			ajax.send(params,this.sendToMocospace.bind(this));
		},
		sendToMocospace:function(r){
			
			AnimationManager.blit('update status success');

			var url = "https://apps.mocospace.com/social/activities/@me/@self?oauth_token="+ r.access_token;
			var status = $("#status").val();
			var params = JSON.stringify({"title":status});
			$.post(url,params);
		},
		initialize:function(){
			
		},
		render:function(){
			this.context = Backbone.Model.instances.toon.toJSON();
			this.$el.html(this.template(this.context));
			return this;
		}

	});
});