define(['backbone','handlebars','text!templates/guildbenefits.hbs','ajax'],function(Backbone,Handlebars,template,ajax){
	return Backbone.View.extend({
		id:"guildBenefitsView",
		className:'mobile-grid-100 tablet-grid-100 grid-100 grid-parent',
		template:Handlebars.compile(template),
		initialize:function(){

		},
		render:function(){
			var context = {}
			if(Backbone.Model.instances.guild){
				var guild = Backbone.Model.instances.guild.toJSON();
				for(var i in guild.perks){
					guild.perks[i]['rank'] = parseInt(i)+1;
					if(guild.members.length < guild.perks[i]['members']){
						guild.perks[i]['className'] = 'disabled';
					}
				}		
				context= guild.perks;
			}
		
			
			this.$el.html(this.template(context));
			return this;
		}
	});
});