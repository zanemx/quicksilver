define(['backbone'],function(Backbone){
	return Backbone.View.extend({
		channel:null,
		socket:null,
		onOpened:function(){
			log("channel created");
		},
		onMessage:function(r){
			var data = r.data;
			// log("on channel message")
			if(typeof(data) == 'string'){
				data = $.parseJSON(data);
				log(data);
			}
			Backbone.Model.instances.toon.onChannelMessage(data);
		},
		onError:function(){
			log('on channel error');
		},
		onClose:function(){
			log('on channel close');
		},
		initialize:function(model){
			this.model = model;
			var token = this.model.get("channelToken");
			if(!token){
				log("no channel token");
				return;
			}
			channel = new goog.appengine.Channel(token);
		    socket = channel.open();
		    socket.onopen = this.onOpened;
		    socket.onmessage = this.onMessage;
		    socket.onerror = this.onError;
		    socket.onclose = this.onClose;
		},
	});
});