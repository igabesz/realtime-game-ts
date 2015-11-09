import { SocketService } from './SocketService';
import * as _ from 'lodash';
import { PERSONAL_INFO_EVENT } from '../common/Connection';
import { LIST_ROOM_EVENT, JOIN_ROOM_EVENT, ListRoomItem, LIST_SHIP_EVENT, ListShipsResponse } from '../common/Room';


/**Extending IScope with the custom properties off the current $scope */
interface IMainScope extends ng.IScope {
    rooms: Array<ListRoomItem>;
    roomView: boolean;
    shipView: boolean;
    roomName: string;
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
        $scope.rooms = [];
        $scope.roomView = true;
        $scope.shipView = false;
        $scope.roomName = "";

		socketService.connect();

        socketService.addHandler(PERSONAL_INFO_EVENT, $timeout, (msg) => {
            this.socketService.listRooms();
        });

        socketService.addHandler(LIST_ROOM_EVENT, $timeout, (msg) => {
            this.handleListRooms(msg.rooms);
        });

        socketService.addHandler(JOIN_ROOM_EVENT, $timeout, (msg) => {
            this.socketService.listShips();
        });

        socketService.addHandler(LIST_SHIP_EVENT, $timeout, (msg) => {
            if(msg.success) {

            }
            else console.log(msg.errors);
        });

        this.socketService.getPersonalInfo(sessionStorage['token']);
	}

    handleListRooms(rooms){
        this.$scope.rooms = rooms;
    }

    joinRoom(id: string){
        this.socketService.joinRoom(id);
    }

    createRoom(){
        this.socketService.joinRoom(this.$scope.roomName);
    }

}
