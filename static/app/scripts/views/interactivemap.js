define(['backbone','text!templates/interactivemap.hbs','handlebars'],function(Backbone,template,Handlebars){
	return Backbone.View.extend({
		id:'interactiveMapView',
		template:Handlebars.compile(template),
		dragging:false,
		startDragOffset:null,
		events:{
			'mousedown #mapimg':'startDrag',
			'mouseup':'stopDrag',
			'mousemove':'onMouseMove'
		},
		onMouseMove:function(event){
			if(this.dragging){
				var x=event.clientX;
				var y=event.clientY;

				if(!this.startDragOffset){
					this.startDragOffset = {
						x:event.offsetX,
						y:event.offsetY
					}
				}
				var left = x - this.startDragOffset.x;
				var right = y - this.startDragOffset.y;
				log(left + " : " + right);
				var img = $("#mapimg").css({

					'left':left,// - this.startDragOffset.x,
					'top':right// - this.startDragOffset.y
					});
			}	
		},
		startDrag:function(e){
			e.preventDefault();
			this.dragging = true;
		},
		stopDrag:function(){
			this.dragging = false;
			this.startDragOffset = null;
		},
		initialize:function(){
			this.render();
		},
		render:function(){
			this.$el.html(this.template({}));
			// _.defer(function(){}.bind(this));
			$(".wrapper").html(this.el);
		}
	})
});