import { MainController } from './MainController'; 
import { SocketService } from './SocketService';
import { SpaceGame } from './SpaceGame';


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


//Graphics
console.log('App. Loading phaser')
System.import('phaser').then(() => {
	console.log('App. Phaser loaded, creating SpaceGame');
	var game = new SpaceGame();
});
