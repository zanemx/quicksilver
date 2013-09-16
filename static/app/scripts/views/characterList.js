define(['backbone','handlebars','text!templates/characterList.hbs'],function (Backbone,Handlebars,template){

	return Backbone.View.extend({

		id:'characterList',
		className:'mobile-grid-100',
		
		template:Handlebars.compile(template),

		events:{
			"click .characterFrame":"onSelectToon",
			"click #createNew":'createNew'
		},
		createNew:function(){
			Backbone.history.navigate('/create/' + this.userid,{trigger:true});
		},

		onSelectToon:function(e){
			// var target = $(e.currentTarget).attr("data");
			// log(target);
			var toonName=$(e.currentTarget).find('h3').text();
			Backbone.history.navigate('/game/' + toonName,{trigger:true});
		},

		initialize:function(collection,userid){
			this.userid = userid;
			this.render();
		},
		render:function(){
			var context = this.collection.toJSON();
			log(context);
			this.$el.html(this.template(context));
			$(document.body).html(this.el);
			return this;
		}
	});
});