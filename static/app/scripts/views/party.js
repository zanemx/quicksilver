define(['backbone','handlebars','text!templates/party.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:"partyView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		events:{
			'click .partyFrame':'onAddMember'
		},
		onAddMember:function(e){
			var el = $(e.currentTarget);
			var oldMember = el.attr("_name");

			this.friendsList(function(friend){
				// log(friend);
				var params = {
					action:'getFriendToonsByMocoID',
					mocoid:friend.id
				}
				ajax.send(params,function(r){
					// log(r);
					var toons = r.toons;
					if(toons.length>0){
						this.toonList(toons,function(name){
							this.model.addPartyMember(name,oldMember);
						}.bind(this));
						
					}else{
						this.confirm("Friend Invite",friend.displayName + " doesn't have any characters yet. Would you like to invite them to Quicksilver?",'agony',function(result){
							if(result)
								this.inviteFriends();
						}.bind(this));
						
					}
				},this);

			}.bind(this));
		},
		
		initialize:function(){

			this.model = Backbone.Model.instances.toon;
			this.model.on('change:party',this.render,this);
			this.model.getParty();
		},
		render:function(){
			var context = this.model.toJSON();
			context.addFrame = context.party.length == 1;
			context.group_gearscore = context.gearscore;
			for(var i=0;i < context.party.length;i++){
				var mem = context.party[i];
				context.group_gearscore+=mem.gearscore;
			}
			this.$el.html(this.template(context));
			_.defer(this.delegateEvents.bind(this));
			return this;
		},
	});
});