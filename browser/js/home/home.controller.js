app.controller('HomeCtrl', function($scope, HomeService, $state){
	// to create manipulatable app obj
	var testApp = app; 
	console.log('_MAIN_APP_', testApp);

	//attached to button so I can run this when I want
	$scope.run = function(){
		$scope.components = testApp;	
		$scope.states = $state.get();
	};




});