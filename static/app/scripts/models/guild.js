define(['backbone','ajax'],function(Backbone,ajax){
	return Backbone.Model.extend({
		initialize:function(){
			
		},
		inviteToGuild:function(name){
			ajax.send({action:'inviteToGuild',name:name,guildName:this.get("name")},function(r){
				if(r.success)
					AnimationManager.blit('inviting ' + name + ' to the guild.');
				else
					AnimationManager.blit(r.error);
			});
		},
		leaveGuild:function(){
			var guild = this.toJSON();
			guild.action = 'leaveGuild';
			ajax.send(guild);
			AnimationManager.blit('You have left ' + guild.name);
		},
		kickMember:function(name){
			var guild = this.toJSON();
			guild['playerToKick'] = name;
			guild.action='kickMember';
			ajax.send(guild);
			AnimationManager.blit(name + ' has been removed from the guild.');
		}
	});
})