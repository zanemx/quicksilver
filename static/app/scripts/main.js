'use strict';
require.config({
	paths:{
		jquery:'vendor/jquery/jquery',
		underscore:'vendor/underscore-amd/underscore',
		backbone:'vendor/backbone-amd/backbone',
		// modelBinder:'vendor/backbone.modelbinder/Backbone.ModelBinder',
		// knockout:'vendor/knockout.js/knockout',
		text:'vendor/text/text',
		handlebars:'vendor/handlebars/handlebars',
		moment:'vendor/moment-amd/moment',
		ajax:'vendor/ajax/ajax',
		buzz:'vendor/buzz/buzz',
		// easel:'vendor/easeljs/lib/easeljs-0.7.0.min',
		// sparks:'vendor/Sparks',
		// three:'vendor/three',
		// tween:'vendor/tween.min'
	},
	shim:{
		'handlebars':{
			exports:'Handlebars'
		},
		// easel:{
		// 	exports:'createjs'
		// },
		// sparks:{
		// 	exports:'SPARKS'
		// },
		// three:{
		// 	exports:'THREE',
		// 	deps:['tween']
		// },
		// tween:{
		// 	exports:'TWEEN'
		// }
	}
});


window.log = function(m){console.log(m);}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

// google fastclick 
require(['utils/fastclick'], function(FC) {
    new FC(document.body);
});

// preload spritesheets
require(['jquery'],function($){
	function preload(images){
		var i = 0;
		$(images).each(function(){
			$('<img/>').load(function(){
				i++;
				if(i == images.length){
					// log("load complete");
				}
			})[0].src = this;
		});
	}
	preload([
		'static/app/css/icons.png',
		'static/app/css/npcs.png',
		'static/app/css/maps.png'
	]);
});

// MOCOSPACE SPECIFIC ORIENTATION CHANGE
// var moco_loader = window.setInterval(function(){
// 	if(window['MocoSpace']){
// 		// Listen for moco orientation changes
		

// 		// alert("mocospace api loaded");
// 		window.clearInterval(moco_loader);
// 	}
// },500);

// // fix for ios oriantation bug
// if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
//   var viewportmeta = document.querySelector('meta[name="viewport"]');
//   if (viewportmeta) {
//     viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
//     document.body.addEventListener('gesturestart', function() {
//       viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
//     }, false);
//   }
// }
window.isLocal = window.location.href.search('://localhost') >-1;

window.capitalize = function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// SIMPLE POINT SYSTEM
var Point = function(x,y){
	return {
		x:x,
		y:y
	}
}
Point.make = function(x,y){
	return {
		x:x,
		y:y		
	}
}
Point.fromElem = function($elem){
	return {
		x:$elem.offset().left + $elem.width() /2,
		y:$elem.offset().top + $elem.height() /2
	}
}
Point.add = function(p1,p2){
	return {
		x:p1.x+p2.x,
		y:p1.y+p2.y
	}
}
Point.sub = function(p1,p2){
	return {
		x:p1.x-p2.x,
		y:p1.y-p2.y
	}
}
Point.mult = function(p1,p2){
	return {
		x:p1.x*p2.x,
		y:p1.y*p2.y
	}
}

// GLOBAL UTILS
var qsutils = {
	colorByRewardType:function(type){
		return {
			exp:'lime',
			essence:'rgb(233, 22, 233)',
			energy:'#8686FF',
			hit:'orange',
			gold:'yellow'
		}[type.toLowerCase()]
	},
	colorByGrade:function(grade){
		return {
			common:'white',
			uncommon:'lime',
			rare:'#8686FF',
			epic:'rgb(233, 22, 233)'
		}[grade.toLowerCase()]	
	},
	uncamelize:function(s){
		return s.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
	}
	// color:{
	// 	epic:this.colorByGrade('epic'),
	// 	rare:this.colorByGrade('rare'),
	// 	uncommon:this.colorByGrade('uncommon'),
	// 	common:this.colorByGrade('common')
	// }
}
window.qsutils =qsutils;

// set up load indicator spinner 
require(['utils/spin','jquery'],function(Spinner,$){
	var opts = {
		lines: 13, // The number of lines to draw
		length: 20, // The length of each line
		width: 10, // The line thickness
		radius: 30, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: 'orange', // #rgb or #rrggbb or array of colors
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};
	var target = $('.loadingIndicator');
	var spinner = new Spinner(opts).spin();
	target.append(spinner.el);

	// FUNC SHOW LOADING INTICATOR
	window.showLoading = function(){
		loadingIndicator_timeout = window.setInterval(window.hideLoading,5000)
		$(".loadingIndicator").fadeIn(100);
	}
	window.hideLoading = function(){
		window.clearInterval(loadingIndicator_timeout);
		$(".loadingIndicator").fadeOut(100);
	}
});

var loadingIndicator_timeout = null;//setInterval(window.hideLoading,5000);

// JQUERY EXTENSIONS
require(['jquery'],function($){
	$.extend({
		  getUrlVars: function(){
		    var vars = [], hash;
		    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		    for(var i = 0; i < hashes.length; i++)
		    {
		      hash = hashes[i].split('=');
		      vars.push(hash[0]);
		      vars[hash[0]] = hash[1];
		    }
		    return vars;
		  },
		  getUrlVar: function(name){
		    return $.getUrlVars()[name];
		  }
	});
});

// HANDLEBAR HELPERS
require(['handlebars'],function(Handlebars){
	Handlebars.registerHelper('toLower',function(options){
		return options.fn(this).toLowerCase();
	});
	Handlebars.registerHelper('capitalize', function(str) {
	      return str.charAt(0).toUpperCase() + str.slice(1);
	});

	Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
		switch (operator) {
			case "==":
				return (v1 == v2) ? options.fn(this) : options.inverse(this);
			case "===":
				return (v1 === v2) ? options.fn(this) : options.inverse(this);
			case "<":
				return (v1 < v2) ? options.fn(this) : options.inverse(this);
			case "<=":
				return (v1 <= v2) ? options.fn(this) : options.inverse(this);
			case ">":
				return (v1 > v2) ? options.fn(this) : options.inverse(this);
			case ">=":
				return (v1 >= v2) ? options.fn(this) : options.inverse(this);
			default:
				return options.inverse(this);
		}
	});
});

// require(['views/qsview'],function(QSView){
// 	window.qsview = QSView
// })

require(['backbone','router','ajax','utils/animations','views/buypremium'],function(Backbone,Router,ajax,AnimationManager,BuyPremiumView){



	window.addPartyMember = function(name){
		var params = {
			action:'addPartyMember',
			name:name
		}
		ajax.send(params,function(r){
			log(r);
		});
	}


    var moco_loader = window.setInterval(function(){
        if(window['MocoSpace']){
            // Listen for moco orientation changes
            window.MocoSpace.registerOrientationListener(function(orientation) {setTimeout(window.MocoSpace.resizeGameIframe,1000);});
            // Listen for orientation changes
            window.addEventListener("orientationchange", function() {setTimeout(window.MocoSpace.resizeGameIframe,1000);}, false);
            // Listen for resize changes
            window.addEventListener("resize", function() {setTimeout(window.MocoSpace.resizeGameIframe,1000);}, false);
            // alert("mocospace api loaded");
            window.clearInterval(moco_loader);
            // alert('moco loaded');
        }
    },500);

	Backbone.Model.instances = {}
	Backbone.config = {}
	Backbone.cache = {}

	// ADD LAYERS TO BODY
	$(document.body).prepend($("<div class='animationLayer' style='position:absolute; width:0;height:0; top:0; left:0;'></div>"));
	$(document.body).prepend($('<div class="wrapper grid-container grid-parent"></div>'));
	$(document.body).append($('<div class="topFrame" style="position:absolute;top:0;left:0;pointer-events:none;"></div>'));

	// INITIALIZE ANIMATION MANAGER
	window.AnimationManager = AnimationManager.initialize();

	// ADD GLOBAL EVENT DISPATCHER OBJECT
	window.vent = _.extend({},Backbone.Events);
	window.CHARACTER_CHANGE = 'CHARACTER_CHANGE';
	

	window.onresize = function(e){
		vent.trigger('resize',e);
	}

	vent.on('resize',function(e){
		// log(e)
		// ALIGN POPOVER
		var popover  =$(".popover");
		if(popover.css('display') == 'block'){
			popover.offset({
				left:window.innerWidth*0.5 - popover.width()*0.5 - 30,
				top:window.innerHeight*0.3 - popover.height()*0.5
			});
		}
	});

	// ParticleEngine.init();
	Backbone.View.prototype.inviteFriends = function(){
		MocoSpace.inviteFriends('Play Quicksilver!','Come Play the hottest new rpg on MocoSpace!','Start Playing','inviting_user_name=' + this.model.get('name'),
		    function(response) {
		       if (response.hadError()) {
		           alert("Error sending invites: "+response.getErrorMessage());
		       } else {
		           alert("Invites sent to: "+response.getData());
		       }
		    }
		)
	},
	Backbone.View.prototype.toonList = function(toons,callback){
		var con = $(document.createElement('div'));
		con.addClass('friendsList');

		// populate list
		for(var i = 0; i < toons.length;i++){
			var f = toons[i];
			// user name 
			var toon = $(document.createElement('h5')).text(f);
			toon.addClass('cursor');
			toon.css({
				'margin':10,
				'font-size':'2em'
			});
			toon.click(function(){
				var el = $(this);
				callback(el.text());
				con.remove();
			});
			con.append(toon);
		}

		this.$el.append(con);
	}
	Backbone.View.prototype.friendsList = function(callback){
		if(Backbone.cache.friendsList){
			this.$el.append(Backbone.cache.friendsList);
			return;			
		}
		var friends = Backbone.config.friends;
		if(!friends)return;
		if(!friends.length)return;
		var con = $(document.createElement('div'));
		con.addClass('friendsList');

		// sample data
		// addresses: Array[0]
// displayName: "wet.warm.chocha352"
// id: "60835121"
// name: Object
// formatted: "A _ L _ A _ I _ N _ A"
// givenName: "A _ L _ A _ I _ N _ A"
// __proto__: Object
// signupDomain: "mocospace"
// thumbnailUrl: "http://cdn-img.mocospace.com/static/r228345/html/images/no_photo.png"

		// populate list
		for(var i = 0; i < friends.length;i++){
			var f = friends[i];
			var frame = $(document.createElement('div'));
			frame.data(f);
			frame.click(function(){
				var el = $(this);
				callback(el.data());
				con.detach();
			});
			frame.addClass('cursor');
			frame.css({
				'position':'relative',
				'float':'left',
				'overflow':'hidden'
			});

			// user image
			var img = $(document.createElement('img'));
			img.css({
				'height':90,
				'width':90
			});
			img.attr('src',f.thumbnailUrl);
			frame.append(img);

			// user name 
			var displayName = $(document.createElement('h6')).text(f.displayName);
			displayName.css({
				'position':'absolute',
				'left':0,
				'bottom':0,
				'background':"rgba(0,0,0,0.7)"
			});
			frame.append(displayName);

			con.append(frame);
		}

		this.$el.append(con);

		Backbone.cache.friendsList = con;
	}

	// ADD CLOSE EVENT TO BACKBONE VIEWS
	Backbone.View.prototype.close = function(){
		this.remove();
		this.unbind();
		if (this.onClose){
			this.onClose();
		}
	}

	// GLOBAL POPOVER
	Backbone.View.prototype.confirm = function(title,content,className,callback){
		var popover = $(".popover");
		$("#popoverTitle").text(title);
		$("#popoverContent").text(content);
		if(className){
			$("#popoverIcon").removeClass().addClass('iconFrame qsicons ' + className);
		}
		popover.css({'top':0,'left':0});
		popover.offset({
			left:window.innerWidth*0.5 - popover.width()*0.5 - 30,
			top:window.innerHeight*0.3 - popover.height()*0.5
		});
		popover.fadeIn('fast');

		$("#popoverCancel").unbind('click');
		$("#popoverOk").unbind('click');

		if(callback){
			$("#popoverCancel").click(function(){
				callback(false);
				popover.hide();
			});
			$("#popoverOk").click(function(){
				callback(true);
				popover.hide();
			});

			AudioManager.play('tick');
		}
	}

	Backbone.View.prototype.outOfEnergy = function(callback){
		this.confirm('Out Of energy', 'Get more Stamina?','blessing',function(yes){
			if(yes){
				this.buyPremium();
			}
		}.bind(this));
	}
	Backbone.View.prototype.outOfEssence = function(callback){
		this.confirm('Out Of essence', 'Get more essence?','blessing',function(yes){
			if(yes){
				this.buyPremium();
			}
		}.bind(this));
	}

	Backbone.View.prototype.buyPremium = function(){

		var view = new BuyPremiumView;
		$(document.body).append(view.el);
	}


	Backbone.View.prototype.onload = function(){}

	Backbone.View.lootFrameCount = 0;
	Backbone.View.prototype.createLootFrame = function(item){
		var cloner = $(".lootFrame").clone();
		var frame = $(document.createElement('div')).html(cloner.html()).addClass('lootFrameClone');
		frame.find(".lootFrameIcon").addClass(item.className);
		frame.find(".lootFrameContent").text(item.name).css('color',item.color);

		// additional stats
		for(var key in item){
			var value = item[key];
			// log(key + ' : ' + item[key]);
			if(key == 'level' || key == 'intelligence' || key == 'endurance' || key == 'strength' || key == 'defense'){
				if(key == 'level'){
					var stat = $(document.createElement('div')).text('Item ' + key + ' ' + value).addClass('stat');
					stat.css("color","orange");
					frame.find(".lootFrameStats").prepend(stat);
				}else{
					var stat = $(document.createElement('div')).text(key + ' ' + value).addClass('stat');
					frame.find(".lootFrameStats").append(stat);
				}
			}
		}

		frame.css({
			'display':'block'
		});
		$(".animationLayer").append(frame);
		frame.offset({
			left:window.innerWidth*0.5 - 300*0.5,
			top:window.innerHeight*0.2  + (frame.height() * Backbone.View.lootFrameCount)
		});

		frame.hide();
		frame.fadeIn('fast');

		// var animHeight = (frame.height() * Backbone.View.lootFrameCount);
		// log(animHeight)
		// frame.animate({
		// 	top:animHeight
		// },'fast');
		frame.find(".lootFrameOkButton").click(function(){
			frame.remove();
			Backbone.View.lootFrameCount--;

			_.defer(function(){
				AudioManager.play('tick');
			});
		});

		Backbone.View.lootFrameCount++;

		_.defer(function(){
			AudioManager.play('Sword_scrape');
		});
	}

	Backbone.View.itemDetailsFrameCount = 0;
	Backbone.View.prototype.itemDetailsFrame = function(item){
		$(".itemDetailsFrameClone").remove();
		Backbone.View.itemDetailsFrameCount = 0;
		var cloner = $(".itemDetailsFrame").clone();
		var frame = $(document.createElement('div')).html(cloner.html()).addClass('itemDetailsFrameClone');
		frame.find(".itemDetailsFrameIcon").addClass(item.className);
		frame.find(".itemDetailsFrameContent").text(item.name).css('color',item.color);

		// additional stats
		for(var key in item){
			var value = item[key];
			if(key == 'level' || key == 'intelligence' || key == 'endurance' || key == 'strength' || key == 'defense'){
				if(key == 'level'){
					var stat = $(document.createElement('div')).text('Item ' + key + ' ' + value).addClass('stat');
					stat.css("color","orange");
					frame.find(".itemDetailsFrameStats").prepend(stat);
				}else{
					var stat = $(document.createElement('div')).text(key + ' ' + value).addClass('stat');
					frame.find(".itemDetailsFrameStats").append(stat);
				}
			}
		}

		frame.css('display','block');
		$(".animationLayer").append(frame);
		frame.offset({
			left:window.innerWidth*0.5 - 300*0.5,
			top:window.innerHeight*0.3 - frame.height() * Backbone.View.itemDetailsFrameCount
		});
		frame.find(".itemDetailsFrameOkButton").click(function(){
			frame.remove();
			Backbone.View.itemDetailsFrameCount--;
		});

		Backbone.View.itemDetailsFrameCount++;
	}

	Backbone.View.prototype.exploreDetails = function(title,content,xp,gold){
		var con= Backbone.cache['explorePopover'];
		if(con == undefined){
			Backbone.cache['explorePopover'] = con = $("#explorePopover");
			$(".animationLayer").append(con);
			$("#explorePopoverOk").click(function(){
				$("#explorePopover").hide();
			});
		}
		$("#explorePopoverTitle").text(title);
		$("#explorePopoverContent").text(content);
		$("#explorePopoverGold").text('gold ' + gold);
		$("#explorePopoverXp").text('xp ' + xp);
		
		con.css({
			left:window.innerWidth*0.5 - con.width()*0.5 - 30,
			top:window.innerHeight*0.3 - con.height()*0.5
		});
		con.show();
	}

	// START ROUTER
	new Router();
	Backbone.history.start();
});

require(['buzz'],function(buzz){

	var baseurl = 'static/app/audio/';
	buzz.defaults.preload="auto";
	buzz.defaults.autoplay=false;

	var AudioManager={};
	AudioManager.sounds={};
	AudioManager.canPlayMultiple=true;
	AudioManager.hasWebAudio=false;
	AudioManager.context=null;
	AudioManager.initComplete=false;
	AudioManager.play=function(id,loop,volume){
		if(!AudioManager.sounds[id]){
			log("cant find "+id);
			return;
		}
		if(AudioManager.hasWebAudio){
			AudioManager.play_webAudioContext(id,loop,volume);
		}else{
			if(loop){
				AudioManager.sounds[id].play().loop();
			}else{
				AudioManager.sounds[id].play();
			}
		}
	};
	AudioManager.mute=function(id){
		AudioManager.sounds[id].mute();
	};
	AudioManager.getSound=function(id){
		return AudioManager.sounds[id];
	};
	AudioManager.addSound=function(id,filename){
		if(!AudioManager.initComplete){
			AudioManager.init();
		}
		if(AudioManager.hasWebAudio){
			AudioManager.load(id,filename);
		}else{
			AudioManager.sounds[id]=new buzz.sound(baseurl + filename);
		}
	};
	AudioManager.init=function(){
		AudioManager.createContext();
		AudioManager.initComplete=true;
		if(AudioManager.hasWebAudio){
			log("web audio context available!!!");
		}
	};
	AudioManager.createContext=function(){
		if(window.AudioContext){
			AudioManager.context=new AudioContext();
		}else{
			if(window.webkitAudioContext){
				AudioManager.context=new webkitAudioContext();
			}
		}
		AudioManager.hasWebAudio=Boolean(AudioManager.context);
	};
	AudioManager.play_webAudioContext=function(id,loop,volume){

		return;

		if(!AudioManager.context){
			AudioManager.createContext();
		}
		
		var sound=AudioManager.sounds[id];

		if(!sound)return
			
		sound.loop=true;
		sound.source=AudioManager.context.createBufferSource();
		sound.source.buffer=AudioManager.sounds[id]["buffer"];
		if(loop){
			sound.source.loop=true;
		}
		// log("Break Here");
		// debugger;
		var node=AudioManager.context.createGain();
		sound.source.connect(node);
		node.gain.value=volume=="undefined"?1:volume;
		sound.source.connect(node);
		node.connect(AudioManager.context.destination);
		sound.source.noteOn(0);
	};
	AudioManager.loadCue = [];
	AudioManager.loading = false;
	AudioManager.loadComplete = function(){
		// log('load complete')
		//if(!isLocal)
			//AudioManager.play('track',true);
	}
	AudioManager.load=function(id,fileName){
		if(AudioManager.loading){
			AudioManager.loadCue.push([id,fileName]);
			return;
		}

		AudioManager.loading=true;

		// log('loading : ' +baseurl+ fileName);
		var r=new XMLHttpRequest();
		r.open("GET",baseurl + fileName,true);
		r.responseType="arraybuffer";
		r.onload=function(){
			AudioManager.context.decodeAudioData(this.response,function(_b){
				AudioManager.sounds[id]={"id":id,"buffer":_b,"source":null,"loop":false,"isPlaying":false,"filter":null,"muted":false,"volume":1};
				if(!AudioManager.loadCue.length)
					AudioManager.loadComplete();
			},function(){
				console.log("unable to process audio file. : "+fileName);
			});
			
			if(AudioManager.loadCue.length>0){
				AudioManager.loading=false;
				AudioManager.load.apply(AudioManager,AudioManager.loadCue.pop());
			}
		};
		r.send();
	};

	AudioManager.addSound('tick','tick.mp3');
	AudioManager.addSound('track','track.wav');

	// vocal tracks
	AudioManager.addSound('DwarfMaleGreeting1','DwarfMaleGreeting1.wav');
	AudioManager.addSound('ElfMaleGreeting1','ElfMaleGreeting1.wav');
	AudioManager.addSound('HumanMaleGreeting1','HumanMaleGreeting1.wav');

	// sound affects
	AudioManager.addSound('Victory','_Victory.wav');
	AudioManager.addSound('lose','lose.wav');
	AudioManager.addSound('timpani','timpani.wav');
	AudioManager.addSound('success','success.wav');
	AudioManager.addSound('buy_item','buy_item.wav');
	AudioManager.addSound('exp','exp.wav');

	// battle sounds
	AudioManager.addSound('MeleeHit','MeleeHit.wav');
	AudioManager.addSound('Sword_scrape','Sword_scrape.wav');

	window.AudioManager = AudioManager;

});