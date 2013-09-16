'use strict';
require.config({
	paths:{
		jquery:'vendor/jquery/jquery',
		underscore:'vendor/underscore-amd/underscore',
		backbone:'vendor/backbone-amd/backbone',
		knockout:'vendor/knockout.js/knockout',
		text:'vendor/text/text',
		handlebars:'vendor/handlebars/handlebars',
		moment:'vendor/moment-amd/moment',
		ajax:'vendor/ajax/ajax'

	},
	shim:{
		'handlebars':{
			exports:'Handlebars'
		}
	}
});
                 
window.log = function(m){console.log(m);}

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


require(['backbone','router'],function(Backbone,Router){

	// ADD GLOBAL EVENT DISPATCHER OBJECT
	window.vent = _.extend({},Backbone.Events);

	// ADD CLOSE EVENT TO BACKBONE VIEWS
	Backbone.View.prototype.close = function(){
		log("closing view");
		this.remove();
		this.unbind();
		if (this.onClose){
			this.onClose();
		}
	}

	// START ROUTER
	new Router();
	Backbone.history.start();
});