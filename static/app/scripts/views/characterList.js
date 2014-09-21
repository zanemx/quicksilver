define(['backbone','handlebars','text!templates/characterList.hbs','ajax'],function (Backbone,Handlebars,template,ajax){

	return Backbone.View.extend({

		id:'characterList',
		className:'mobile-grid-100',
		
		template:Handlebars.compile(template),

		events:{
			"click .characterFrameBox":"onSelectToon",
			"click #createNew":'createNew'
		},
		createNew:function(){
			var div = $(document.createElement('div')).addClass("box").css({
				'margin':'auto',
				'text-align':'center',
				'margin-top':'44%'
			}).text("Loading Quickislver Character Creator.");
			this.$el.html(div);
			Backbone.history.navigate('/create/' + this.userid,{trigger:true});
		},

		onSelectToon:function(e){
			var toonName=$(e.currentTarget).find('#characterName').text();

			var div = $(document.createElement('div')).addClass("box").css({
				'margin':'auto',
				'text-align':'center',
				'margin-top':'44%'
			}).text("Loading " + toonName);

			var toon = _.find(this.context,function(t){
				return t.name == toonName;
			});

			// log(toon.get("toonkey"));

			this.$el.html(div);

			// log(toon);
			Backbone.history.navigate('/game/' + toon.keyid,{trigger:true});

			AudioManager.play('timpani');
		},

		initialize:function(model,userid){
			this.userid = userid;
			ajax.send({action:'getCharacterList',keyid:userid},function(r){
				this.context = r.toons;
				this.render();
			}.bind(this));
		
		},
		render:function(){
			this.$el.html(this.template(this.context));
			$(".wrapper").html(this.el);
			// this.delegateEvents();
			return this;
		}
	});
});