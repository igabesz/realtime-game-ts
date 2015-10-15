import { SocketService } from './SocketService';
import * as _ from 'lodash';


/**Extending IScope with the custom properties off the current $scope */
interface IMainScope extends ng.IScope {
	player: {
		x: number,
		y: number
	}
}


export class MainController {
	/**This is required if the project is minified so that the parameters in the 
	 * constructor are shortened thus Angular won't know what is requested 
	 */
	static $inject = ['$scope', '$timeout', 'SocketService'];
	
	/**Constructor parameters are resolved by the $inject static member 
	 * using the already registered Angular services
	 */
	constructor(
		private $scope: IMainScope, 
		private $timeout: ng.ITimeoutService,
		private socketService: SocketService
	) {
		// Creating player object
		$scope.player = {
			x: 0,
			y: 0
		};
		// Adding state event handler
		socketService.addHandler('state', $timeout, (msg) => {
			// Lodash is extremely useful
			_.merge($scope.player, msg.player);
		});
	}

	left() {
		console.log('left');
		this.socketService.move('left');
	}
	
	right() {
		console.log('right');
		this.socketService.move('right');
	}
}
