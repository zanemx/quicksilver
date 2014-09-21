define(['backbone','handlebars','text!templates/attributes.hbs'],function(Backbone,Handlebars,template){
	return Backbone.View.extend({
		id:'attributesView',
		className:'grid-100 tablet-grid-100 mobile-grid-100 box',
		template:Handlebars.compile(template),
		selectedAttribute:null,
		attributeDescriptions:{
			"Gear Score":"This is a total count of stat bonus values that your gear gives you.  This helps size up opponents and effects who you can duel.",
			Strength:'Increases your physical attack power and physical defence',
			Intelligence:'Increases your magical attack power and magical defence',
			Endurance:'Increases your energy points and reduces damage taken',
			Defense:'Helps your overall ability avoid damage from any attack',
			Skillpoints:''

		},
		events:{
			"click .attributesButton":"onButtonClick",
			'click .attribute':'onAttribute',
			'click #addPoint':'onAddPoint',
			'click .attributesViewPotionIcon':'onPotionClick'
		},
		onPotionClick:function(e){
			var el = $(e.currentTarget);
			var data = _.find(this.model.get("buffs"),function(buff){
				return el.attr('_id') == buff.id;
			});

			if(data){
				this.itemDetailsFrame(data);
			}
		},
		onAttribute:function(e,attrib){
			var el,target;
			if(attrib){
				target = attrib;
			}else{
				el = $(e.currentTarget);
				target = el.attr('_id');
			}

			
			// this.selectedAttribute = target.toLowerCase();

			var tlower = target.toLowerCase();
			if(tlower != "gear score" && tlower != 'skillpoints' && tlower != 'hp' && tlower != 'damage' && tlower != 'stamina regen rate'){
				this.selectedAttribute = tlower;
				$("#addPoint").show();
				$("#attributeTitle").text(target);
				$("#attributeContent").text(this.attributeDescriptions[target]);
			}else{
				this.selectedAttribute = null;
				$("#addPoint").hide();
				$("#attributeTitle").text('');
				$("#attributeContent").text('Select an attribute to learn more.');
			}
		},
		onAddPoint:function(){
			if(!this.model.useSkillPoint(this.selectedAttribute)){
				AnimationManager.blit("No skillpoints");
			}
		},

		initialize:function(){
			this.model = Backbone.Model.instances.toon;
			this.render();
			this.model.on('change:calculated',function(m){
				log(m);
				$(".attribute .stat").eq(2).text(m.attributes.calculated.strength);
				$(".attribute .stat").eq(3).text(m.attributes.calculated.intelligence);
				$(".attribute .stat").eq(4).text(m.attributes.calculated.defense);
				$(".attribute .stat").eq(5).text(m.attributes.calculated.endurance);

				$("#skillpoints").text(m.get('skillpoints'));

				// this.render();
				this.delegateEvents();
			}.bind(this));
		},
		render:function(){
			var context = Backbone.Model.instances.toon.toJSON();
			this.$el.html(this.template(context));

			_.defer(function(){
				// if(this.selectedAttribute)
				// 	this.onAttribute(null,this.selectedAttribute);
				this.delegateEvents();
			}.bind(this));
			
			return this;
		}
	});
});