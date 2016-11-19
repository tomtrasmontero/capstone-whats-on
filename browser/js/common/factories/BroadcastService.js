app.factory('BroadcastService', function($http, $rootScope, $window){
	var channels = []; 

	var BroadcastService = function(){};

		BroadcastService.prototype.reduceView = function(channelName){ //reduce view count by 1
			return $http.put('/api/channels/reduce/'+ channelName)
			.then(function(result){
				return result;
			});
		};

		BroadcastService.prototype.increaseView = function(channelName){ //increase view count by 1
			return $http.put('/api/channels/increase/'+ channelName)
			.then(function(result){
				return result;
			});
		};

		BroadcastService.prototype.createChannel = function(channelId, extra){ //add a new channel to database after someone opens a room
			return $http.post('/api/channels/'+channelId, extra)
			.then(function(result){
					channels.push(result.data); // this code is probably not needed 
				});
		};

		BroadcastService.prototype.findAllChannels = function(){ // get all channels from our database
			return $http.get('/api/channels')
			.then(function(result){
				angular.copy(result.data, channels);
				return channels;
			});
		};

		BroadcastService.prototype.closeRoom = function(channelId){ // remove a room from our database
			var that = this;
			return $http.delete('/api/channels/' + roomId)
			.then(function(result){
					that.findAllChannels(); //this code is probably not needed
				})
			.then(function(){
				console.log(channels);
			});
		};

		//commenting this out for now until we get the rest working as well
	    // $window.onbeforeunload = function (e,confimration,scope) { //this block is about doing something right before the page is unloaded by the browser
	    //     var confirmation = {}; //does not affect our app, it's just for the pop up when you try to refresh the page and stuff
	    //     var event = $rootScope.$broadcast('onBeforeUnload', confirmation);//same as above, just for the pop up
	    //     console.log(scope); // this scope is useless, so you can remove both scope variable in this block of code
	    //     if ($rootScope.broadcasting){ //if the user using this page is a broadcaster, then do the following
	    //     	BroadCastService.closeRoom($rootScope.unwanted); //remove the channel from our database, $rootScope.unwanted is actually the room name for this broadcaster
	    //     	$rootScope.broadcasting = false; //this tells our app that this guy is no longer broadcasting, it's useful when we have a button to stop broadcasting
	    //     }

	    //     if($rootScope.watching){ //if the user using this page is a viewer, then do the following
	    //     	console.log($rootScope.unwatching);
	    //     	BroadCastService.reduceView($rootScope.unwatching);//reduce the view count of the channel by 1, $rootScope.unwatching is the room name the viewer is in
	    //     	$rootScope.watching = false; //this tells our app that this guy is no longer watching. this line is probably not need. everything should be still fine without it.
	    //     }

	    //     if (event.defaultPrevented) { //this is for the pop up
	    //     	console.log(e);
	    //     	console.log("wtf");
	    //     	console.log($rootScope.unwanted);
	    //     	console.log(scope);
	    //     	return confirmation.message;
	    //     }
	    // };
	    
	    // $window.onunload = function (e, scope) { //this is probably not needed as well, since we have handled everything before unload
	    // 	console.log(scope);
	    // 	BroadCastService.closeRoom($rootScope.unwanted);
	    // 	$rootScope.$broadcast('onUnload');
	    // };
	    console.log(BroadcastService);
	    return BroadcastService;		
	})
.run(function(BroadcastService){
	//runs all functions in this Service anytime it is loaded
});


// putting what I had here as an example of what sending the req.body could look like
// app.Service('RoomsService', function($http){
// 	var _rooms = {};

// 	return {
// 		findAll: function(){
// 			return $http.get('/api/rooms')
// 				.then(function(result){
// 					_rooms = result.data;
// 					return _rooms;
// 				});
// 		},

// 		findById: function(id){
// 			return $http.get('/api/' + id)
// 				.then(function(result){
// 					return result.data;
// 				});
// 		},

// 		create: function(name){
// 			return $http.post('/api/rooms', { name: name })
// 				.then(function(result){
// 					return result.data;
// 				});
// 		},

// 		delete: function(name){
// 			return $Http.delete('/api/rooms' + id)
// 				.then(function(result){
// 					return result.data;
// 				});
// 		}
// 	};
// });

