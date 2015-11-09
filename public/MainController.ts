import { SocketService } from './SocketService';
import * as _ from 'lodash';
import { PERSONAL_INFO_EVENT } from '../common/Connection';
import { LIST_ROOM_EVENT, JOIN_ROOM_EVENT, ListRoomItem } from '../common/Room';


/**Extending IScope with the custom properties off the current $scope */
interface IMainScope extends ng.IScope {
    rooms:ListRoomItem[];
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

        socketService.addHandler(PERSONAL_INFO_EVENT, $timeout, (msg) => {
            if(msg.success)this.socketService.listRooms();
            else console.log(msg.errors);
        });

        //$scope.rooms = [];
        socketService.addHandler(LIST_ROOM_EVENT, $timeout, (msg) => {
            if(msg.success) this.handleListRooms(msg.rooms);
            else console.log(msg.errors);
        });

        socketService.addHandler(JOIN_ROOM_EVENT, $timeout, (msg) => {
            if(msg.success) console.log(msg);
            else console.log(msg.errors);
        });

        this.socketService.getPersonalInfo(localStorage['token']);
	}

    handleListRooms(rooms){
        this.$scope.rooms = rooms;
    }

    joinRoom(id: string){
        this.socketService.joinRoom(id);
    }
}
