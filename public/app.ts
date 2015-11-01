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
/** You can enter commands to send the server over Socket.IO
 * Enter data into the text are then press Send.
 * data should be formatted as: eventname:javascriptObject
 * example: joinroom:{"name":"myroom"}
 * Every valid line will be sent. User is warned for every object that is not parsable. (console.warn) 
 * Server response will be logged (console.log)
 */
import { TestController } from './TestController'; 

mainModule.controller('TestController', TestController);

mainModule.directive('test', function() {
  return {
    restrict: 'E',
    template: `
	<div ng-controller="TestController as ctrl" style="margin-top: 200px;">
		<textarea type="text" ng-model="testData" style="width:600px;height:150px;"></textarea>
		<button ng-click="ctrl.sendTestData()">Send</button>
	</div>
	`
  }
});

