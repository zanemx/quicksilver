define(['jquery'],function($){
	return {
		el:$(".animationLayer"),
		start:null,
		animations:[],
		delta:0,
		last:0,
		cue:[],
		animating:false,
		initialize:function(){
			return this;
		},
		step:function(timestamp){
			window.requestAnimFrame(this.step.bind(this));

			this.delta = timestamp - this.last;
			this.last = timestamp;
			
			for(var i = 0; i < this.animations.length;i++){
				this.animations[i].step(this.delta);
				if(this.animations[i].complete){
					this.animations.splice(i,1);
				}
			}
		},
		blit:function(message,color,pos,sound,fontSize){
		
			if(this.animating){
				this.cue.push(arguments);
				return;
			}

			this.animating = true;

			// log(pos);

			if(!this.el[0]){
				this.el = $(".animationLayer");
			}
			
			var width = window.innerWidth;
			var height = window.innerHeight;
			var sprite = $(document.createElement('div')).text(message);
			sprite.css('color',color!=null?color:'yellow');
			sprite.css({
				"font-size":"x-small",
				"white-space":'nowrap',
				// "width":"80%",
				"position":"absolute",
				// "-webkit-transform":"scale(0)"
			});
			if(fontSize){
				sprite.css('font-size',fontSize);
			}
			
			this.el.append(sprite[0]);
			if(pos){
				sprite.offset({
					top:pos.y - sprite.height() / 2,
					left:pos.x - sprite.width() / 2
				});	
			}else{
				sprite.offset({
					top:height*0.3 + ((Math.random() * 200) - 100),
					left:width*0.5 - sprite.width() *0.5
				});
			}

			// sprite[0].style.setProperty("-webkit-transition","top 3s ease-in-out");
			// sprite[0].style.setProperty("-moz-transition","top 3s ease-in-out");
			// sprite[0].style.setProperty("-o-transition","top 3s ease-in-out");
			// sprite[0].style.setProperty("transition","top 3s ease-in-out");

			// sprite[0].style.setProperty("-webkit-transition", "-webkit-transform 0.3s ease");
			// sprite[0].style.setProperty("-webkit-transition", "top 2s ease");

			
			

			_.defer(function(){
				// sprite.css('-webkit-transform','scale(1.5)');
				sprite.addClass('animationBlit');
				// sprite.css("top","30%");
				this.fadeOutAndRemove(sprite);
			}.bind(this));

			if(sound){
				_.defer(function(){
					AudioManager.play(sound);
				});
			}
		},
		fadeOutAndRemove:function(element){
			element.delay(1000).fadeOut(1400,function(){
				$(this).remove();
			});

			// load next cue
			_.delay(function(){
				this.animating = false;
				if(this.cue.length>0){
					var args = this.cue.pop();
					this.blit.apply(this,args);
				}
			}.bind(this),200);
		}
	}
});