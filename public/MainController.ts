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
	};
	
	/** Test */
	sendTestData() : void {
		let text:string = (<any>this.$scope).testData;
		(<any>this.$scope).testData = "";
		let rows:string[] = text.split('\n');
		for(let i:number = 0; i < rows.length; i++) {
			let row:string = rows[i];
			let index:number = row.indexOf('\t')
			if(index != -1){
				let event:string = row.substring(0, index);
				let dataStr:string = row.substring(index + 1);
				let item = JSON.parse(dataStr);
				this.socketService.sendTestData(event, item);
			}
		}
	}
}
