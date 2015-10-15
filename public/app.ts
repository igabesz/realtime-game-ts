import { MainController } from './MainController'; 
import { SocketService } from './SocketService'; 

// Creating the main angular module 
var mainModule = angular.module('spacegame', []);

// Registering services
mainModule.service('SocketService', SocketService);
// Beginning connection. This is a very ugly solution, create a better one!
mainModule.run(['SocketService', (socketService: SocketService) => {
	socketService.connect();
}])

// Registering controllers
mainModule.controller('MainController', MainController);


/** Test Directive */

mainModule.directive('test', function() {
  return {
    restrict: 'E',
    template: `
	<div ng-controller="MainController as ctrl">
		<input type="text" ng-model="testEvent"/>
		<input type="text" ng-model="testData"/>
		<button ng-click="ctrl.sendTestData(testEvent, testData)">Send</button>
	</div>
	`
  }
});
