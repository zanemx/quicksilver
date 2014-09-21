define(['backbone','text!templates/characterCreate.hbs','models/character','ajax','handlebars'], function(Backbone,template,CharacterModel,ajax,Handlebars){
	var view =  Backbone.View.extend({

		id:'characterCreate',
		className:'mobile-grid-100 grid-100 tablet-grid-100 grid-parent',
		template:Handlebars.compile(template),
		events:{
			"click #cancel":"onCancel",
			"change select":"onChange",
			'click #begin':'onSubmit',
			'click #randomize':"generateRandomName"
		},

		descriptions:{
			human:"Moderate in size, they are adaptable to danger.  a <span class='stat'>+10%</span> to Defense",
			elf:"These tall, fair skinned immortals are known for their wisdom.  <span class='stat'>+10%</span> to Intelligence",
			dwarf:"A hard working people, shorter than most, but possess great might.  a <span class='stat'>+10%</span> to Strength",
			warrior:"These fierce fighters favor strength above all else",
			druid:"Always seeking a balance between might and magic",
			wizard:"Knowledge and magic is the source of their power",
			female:"Female gender",
			male:"Male gender",
			spirit:"A soul that inhabits the world of the living"
		},

		onChange:function(e){
			var target = $(e.currentTarget).val();
			switch(target.toLowerCase()){

				case 'human':
				case 'elf':
				case 'dwarf':
					$(".lineageFrame p").html(this.descriptions[target.toLowerCase()]);
					$(".overview span").eq(0).text(window.capitalize(target));
					break;

				case 'female':
				case 'male':
				case 'spirit':
					$(".genderFrame p").html(this.descriptions[target.toLowerCase()]);
					$(".overview span").eq(1).text(window.capitalize(target));
					break;

				case 'warrior':
				case 'druid':
				case 'wizard':
					$(".classFrame p").html(this.descriptions[target.toLowerCase()]);
					$(".overview span").eq(2).text(window.capitalize(target));
					break;
			}
			this.updateImage();
		},

		updateImage:function(){
			var race = $("#selectRace").val().toLowerCase();
			var gender = $("#selectGender").val().toLowerCase();
			var el = $("#characterImage");
			el.removeClass();
			el.addClass("imageFrame npcs " + race + "_" + gender);
			// var src = "static/app/images/characters/heroes/hero_" + $("#selectRace").val().toLowerCase() + "_" + $("#selectGender").val().toLowerCase() + ".png";
			// image.attr('src', src);
		},

		onCancel:function(){
			Backbone.history.navigate('/',{trigger:true});
		},

		onSubmit:function(){
			
			this.model.set('race',$("#selectRace").val());
			this.model.set('gender',$("#selectGender").val());
			this.model.set('name',$("#characterName").val());
			this.model.set('spec',$("#selectClass").val());

			// log(this.model.attributes);
			if(this.model.get("race") == ''){alert("please select a lineage");return}
			if(this.model.get("gender") == ''){alert("please select a gender");return}
			if(this.model.get("spec") == ''){alert("please select a class");return}

			if(this.model.get("name").search(" ") > -1){
				alert("please remove space from name");
				return;
			}
			if(this.model.get("name") == ""){
				alert("Please give your character a name");
				return;
			}
			this.model.set('action','createNewToon');
			log(this.model.attributes);
			ajax.send(this.model.toJSON(),function(r){
				Backbone.config.toonkey = r.toonkey;
				_.delay(function(){
					Backbone.history.navigate("/game/" + Backbone.config.toonkey ,{trigger:true});
				},1);
			});
			
			var div = $(document.createElement('div')).addClass("box").css({
				'margin':'auto',
				'text-align':'center',
				'margin-top':'44%'
			}).text("Checking the Paralellia Great Library Of Records for the name you've chosen. This will just take a moment. Thanks for your patience.");
			this.$el.html(div);
			// this.render();
		},

		chooseRandom:function(){
			// set random values
			this.generateRandomName();
			$("#selectRace").val(['human','elf','dwarf'][Math.floor(Math.random() * 3)]);
			$("#selectGender").val(['male','female','spirit'][Math.floor(Math.random() * 3)]);
			$("#selectClass").val(['warrior','druid','wizard'][Math.floor(Math.random() * 3)]);
			this.updateImage();
			$('select').trigger("change");
		},

		generateRandomName:function(){
			// var c = ['b','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','y'];
			// var v = ['a','e','i','o','u'];
			// var l = Math.round(Math.random()*4+3);
			// var n = Math.random() > 0.5?(v[Math.floor(Math.random()*v.length)]):c[Math.floor(Math.random()*c.length)];
			// for(var i=0; i < l;i++){
			// 	var r = Math.random() > 0.9?(v[Math.floor(Math.random()*v.length)]):c[Math.floor(Math.random()*c.length)];
						
			// 	if(r == 'q'){
			// 		n+= 'u';
			// 	}
			// 	n += r;
			// }

			// n = _.uniq(n,false).join('');
			// n = window.capitalize(n);

			var n = this.getName(3,8,'','');
			$("#characterName").val(n);
		},

		rnd:function(minv, maxv){
			if (maxv < minv) return 0;
			return Math.floor(Math.random()*(maxv-minv+1)) + minv;
		},

		getName:function(minlength, maxlength, prefix, suffix)
		{
			prefix = prefix || '';
			suffix = suffix || '';
			//these weird character sets are intended to cope with the nature of English (e.g. char 'x' pops up less frequently than char 's')
			//note: 'h' appears as consonants and vocals
			var vocals = 'aeiouyh' + 'aeiou' + 'aeiou';
			var cons = 'bcdfghjklmnpqrstvwxz' + 'bcdfgjklmnprstvw' + 'bcdfgjklmnprst';
			var allchars = vocals + cons;
			//minlength += prefix.length;
			//maxlength -= suffix.length;
			var length = this.rnd(minlength, maxlength) - prefix.length - suffix.length;
			if (length < 1) length = 1;
			//alert(minlength + ' ' + maxlength + ' ' + length);
			var consnum = 0;
			//alert(prefix);
			/*if ((prefix.length > 1) && (cons.indexOf(prefix[0]) != -1) && (cons.indexOf(prefix[1]) != -1)) {
				//alert('a');
				consnum = 2;
			}*/
			if (prefix.length > 0) {
				for (var i = 0; i < prefix.length; i++) {
					if (consnum == 2) consnum = 0;
					if (cons.indexOf(prefix[i]) != -1) {
						consnum++;
					}
				}
			}
			else {
				consnum = 1;
			}
			
			var name = prefix;
			
			for (var i = 0; i < length; i++)
			{
				//if we have used 2 consonants, the next char must be vocal.
				if (consnum == 2)
				{
					touse = vocals;
					consnum = 0;
				}
				else touse = allchars;
				//pick a random character from the set we are goin to use.
				c = touse.charAt(this.rnd(0, touse.length - 1));
				name = name + c;
				if (cons.indexOf(c) != -1) consnum++;
			}
			name = name.charAt(0).toUpperCase() + name.substring(1, name.length) + suffix;
			return name;
		},

		

		initialize:function(model,userid){
			this.model = new CharacterModel();
			this.model.set('userid',userid);

			this.render();
			this.chooseRandom();
		}, 

		render:function(){
			this.$el.html(this.template(this.model.toJSON()));
			$(".wrapper").html(this.el);
			this.delegateEvents();
			return this;
		}
	});

	return view;
});