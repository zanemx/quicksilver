define(['backbone','text!templates/characterCreate.hbs','models/character'], function(Backbone,template,CharacterModel){
	var view =  Backbone.View.extend({

		id:'characterCreate',
		className:'mobile-grid-100',
		template:_.template(template),

		events:{
			"click #submit":"onSubmit",
			"click #cancel":"onCancel",
			"change select":"onChange"
		},

		onChange:function(){
			this.updateImage();
		},

		updateImage:function(){
			var image = $("#characterImage");
			var src = "static/app/images/characters/heroes/hero_" + $("#selectRace").val().toLowerCase() + "_" + $("#selectGender").val().toLowerCase() + ".png";
			image.attr('src', src);
		},

		onCancel:function(){
			Backbone.history.navigate('/',{trigger:true});
		},

		onSubmit:function(){
			
			this.model.set('race',$("#selectRace").val());
			this.model.set('gender',$("#selectGender").val());
			this.model.set('name',$("#characterName").val());

			if(this.model.get("name").search(" ") > -1){
				alert("please remove space from name");
				return;
			}
			if(this.model.get("name") == ""){
				alert("Please give your character a name");
				return;
			}
			this.model.set('userid',this.model.get('userid'));
			log(this.model.toJSON());
			this.model.save(null,{
				success:function(){
					// log('new user created successfully.');
					Backbone.history.navigate("/",{trigger:true});
				}
			});

		},

		initialize:function(){
			this.render();
		}, 

		render:function(){
			this.$el.html(this.template(this.model.toJSON()));
			$(document.body).html(this.el);
			return this;
		}
	});

	return view;
});