define(
	[
		'backbone',
		'text!templates/app.hbs',
		'views/stats',
		'models/character'
	],

	function(Backbone,template,StatsView,CharacterModel){

	var AppView =  Backbone.View.extend({

		id:"app",
		className:"mobile-grid-100",

		template:_.template(template),

		initialize:function(){

			// main stats view
			var mCharacter = new CharacterModel();
			mCharacter.set('name','Kayotic');
			mCharacter.set('essence',this.model.get('essence'));
			this.statsView = new StatsView({model:mCharacter});

			this.render();
			return this;
		},

		render:function(){
			
			log(this.model.toJSON());
			// var t = this.template(this.model.toJSON());
			this.$el.append(this.statsView.el);
			// this.$el.html(t);
			$(".wrapper").html(this.el);
		}
	});

	return AppView;
});