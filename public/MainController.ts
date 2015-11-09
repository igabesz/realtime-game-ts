import { SocketService } from './SocketService';
import * as _ from 'lodash';
import { PERSONAL_INFO_EVENT } from '../common/Connection';

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
		socketService.connect();

		// Adding state event handler
		socketService.addHandler('state', $timeout, (msg) => {
			// Lodash is extremely useful
			_.merge($scope.player, msg.player);
		});

        socketService.addHandler(PERSONAL_INFO_EVENT, $timeout, (msg) => {
            console.log(msg);
        });

        this.socketService.getPersonalInfo(localStorage['token']);
	}

}
