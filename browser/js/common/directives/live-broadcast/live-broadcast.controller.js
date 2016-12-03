app.controller('BroadcastLiveCtrl', function($scope,$interval,BroadcastLiveService,$state,$timeout,$rootScope, user, isSubscribing, $stateParams){
    console.log("state params are");
    console.log($stateParams.id);
    console.log($stateParams.thetype);

    $scope.successfullySubscribed = false;
    $scope.user = user;
    if ($state.params.data){
        $scope.watching = $state.params.type == "viewer" ? true : false;
    }

    $scope.isSubscribing = isSubscribing ? true : false;

    $scope.broadcastingEnded = false;

    // ......................................................
    // .......................UI Code........................
    // ......................................................

    $scope.goHome = function(){
        $state.go('channels',{'tag':null, 'category':null, 'channelname':null});
    }

    $scope.subscribe = function(){
        BroadcastLiveService.subscribe($state.params.data.channelID, user.id);
        $scope.successfullySubscribed = true;
        $scope.isSubscribing = true;
        $timeout(function(){
            $scope.successfullySubscribed = false;
        }, 3000);
    }

    $scope.openRoom = function(data) {
        //broadcasting so you only want to send out audio and video
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };
        connection.open(data.channelId);    
    };

    $scope.joinRoom = function(data) {
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };
        // if ($stateParams.id){
            connection.join($stateParams.id);
        // }
        // else{
        //     connection.join(data.channelID);
        // }
    };



    // ......................................................
    // ..................RTCMultiConnection Code.............
    // ......................................................

    var connection = $rootScope.connection;
    // var sConnection = $rootScope.screenConnection;

    connection.socketMessageEvent = 'video-broadcast';
    // sConnection.socketMessageEvent = 'screen-broadcast';

    connection.session = {
        screen: true,
        video: true,
        audio: true,
        data: true,
        oneway: true
    };

    // sConnection.session = {
    //     screen:true,
    //     oneway: true
    // }

    //adding video source to stream broadcast
    connection.onstream = function(event) {

        connection.videosContainer = document.getElementById('video-broadcast');

        console.log(event);
        //select the video tag with "video" id and load source for broadcast
        if(event.stream.isScreen === true){
            document.getElementById('screen-broadcast').src = event.blobURL;
            // connection.screenContainer = event.blobURL
        } else {
            connection.videosContainer.src = event.blobURL
        }

        //Put video tag on muted to fix echo and capture preview image
        if(connection.isInitiator === true){
            connection.videosContainer.muted = true;


            //setting preview image, wait 2 seonds then take pic
            $timeout(function() {
                var vidSrc = connection.videosContainer
                var imgSrc = document.getElementById('canvas');

                //dynamically capture the full video screen
                imgSrc.width = vidSrc.videoWidth;
                imgSrc.height = vidSrc.videoHeight;

                //copy video screen to img
                imgSrc.getContext('2d').drawImage(vidSrc,0,0,vidSrc.videoWidth,vidSrc.videoHeight);
                
                //send final data to save in the backend
                $state.params.data.coverImage = imgSrc.toDataURL();
                BroadcastLiveService.addChannel($state.params.data);
                
            }, 2000);                    
        }

    };

    // Using getScreenId.js to capture screen from any domain
    // Code is used for screen broadcast
    connection.getScreenConstraints = function(callback) {
        getScreenConstraints(function(error, screen_constraints) {
            if (!error) {
                screen_constraints = connection.modifyScreenConstraints(screen_constraints);
                callback(error, screen_constraints);
                return;
            }
            throw error;
        });
    };        

    // ......................................................
    // ..............Starting Broadcast......................
    // ......................................................

    // if($state.params.type === 'broadcast' && $state.params.data){
    //     $scope.uniqueID = $state.params.data.channelId;
    //     console.log("broadcaster data is");
    //     console.log($state.params.data);
    //     $timeout($scope.openRoom($state.params.data),0);
    // } else if ($state.params.type === 'viewer'){
    //     $scope.uniqueID = $state.params.data.channelID;
    //     $timeout($scope.joinRoom($state.params.data),0);
    // } else {
    //     $state.go('broadcastHome')
    // }


    if($stateParams.thetype === 'broadcast' && $state.params.data){
        $scope.uniqueID = $state.params.data.channelId;
        $timeout($scope.openRoom($state.params.data),0);
    } else if ($stateParams.thetype === 'viewer' && $stateParams.id){

        connection.checkPresence($stateParams.id, function(isRoomExist, roomId){ // this is purely khan stuff, it check if there is already a room with the same name on the signaling server
            if (isRoomExist){ // if the room name already exist on the signaling server, a new room will NOT be created. we get a error message. NOT REUSABLE
                $scope.uniqueID = $stateParams.id;
                $timeout($scope.joinRoom($stateParams.id),0);
            }
            else{
                $scope.broadcastingEnded = true;
                $rootScope.$digest();
            }
        })      
        // $scope.uniqueID = $stateParams.id;
        // $timeout($scope.joinRoom($stateParams.id),0);
    } else {        
        $state.go('broadcastHome')
    }


    // ......................................................
    // ....................Basic Chat........................
    // ......................................................


    document.getElementById('input-text-chat').onkeyup = function(e) {
        if (e.keyCode != 13) return;

        // removing trailing/leading whitespace
        this.value = this.value.replace(/^\s+|\s+$/g, '');
        if (!this.value.length) return;

        //update user's chat
        appendDIV(this.value);
        
        //broadcast chat text
        connection.send(this.value);
        this.value = '';
    };

    //upon receiving message, update chat box with remote text
    connection.onmessage = function(event){
        appendDIV(event.data);
    }

    //need to use angular way instad of jquery.
    var chatContainer = document.getElementById('chat-output');
    function appendDIV(event) {
        var div = document.createElement('div');
        div.innerHTML = event.data || event;
        chatContainer.insertBefore(div, chatContainer.lastChild);
        div.tabIndex = 0;
        div.focus();

        document.getElementById('input-text-chat').focus();
    }

    // ......................................................
    // ..................Viewer Count........................
    // ......................................................

    $interval(function(){
        $scope.viewCount= connection.getAllParticipants().length;

        if($stateParams.thetype == "viewer"){
            connection.checkPresence($stateParams.id, function(isRoomExist, roomId){ // this is purely khan stuff, it check if there is already a room with the same name on the signaling server
                if (!isRoomExist){ // if the room name already exist on the signaling server, a new room will NOT be created. we get a error message. NOT REUSABLE
                    $scope.broadcastingEnded = true;
                    $rootScope.$digest();
                }
            })   
        }
           
        //add viewcount to the back end
    },5000);

});