define(['backbone'],function(Backbone){
	return Backbone.View.extend({

		initialize:function(){
			window.vent.on(window.CHARACTER_CHANGE,function(){
				this.model = Backbone.Model.instances.toon;
				log("holy hell")
			},this);
			// can be called from child class like so
			// this.constructor.__super__.initialize.apply(this);
			log("Bam super called yo!");
		}
	});
});