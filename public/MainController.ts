import { SocketService } from './SocketService';
import * as _ from 'lodash';
import { PERSONAL_INFO_EVENT } from '../common/Connection';
import { LIST_ROOM_EVENT, JOIN_ROOM_EVENT, ListRoomItem, LIST_SHIP_EVENT, ListShipsResponse, START_ROOM_EVENT,READY_ROOM_EVENT } from '../common/Room';
import { Ship } from '../common/GameObject';


/**Extending IScope with the custom properties off the current $scope */
interface IMainScope extends ng.IScope {
    rooms: Array<ListRoomItem>;
    ships: Array<Ship>;
    roomView: boolean;
    shipView: boolean;
    gameView: boolean;
    roomName: string;
    roomJoined: string;
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
        $scope.ships = [];
        $scope.roomView = true;
        $scope.shipView = false;
        $scope.gameView = false;
        $scope.roomName = "";
        $scope.roomJoined = "";

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
            $scope.roomView = false;
            $scope.shipView = true;
            $scope.ships = msg.ships;
            console.log(msg);
        });

        socketService.addHandler(READY_ROOM_EVENT, $timeout, (msg) => {
            this.socketService.start();
        });

        socketService.addHandler(START_ROOM_EVENT, $timeout, (msg) => {
            $scope.roomView = false;
            $scope.shipView = false;
            $scope.gameView = true;

            console.log("Game started!");
        });

        this.socketService.getPersonalInfo(sessionStorage['token']);
	}

    handleListRooms(rooms){
        this.$scope.rooms = rooms;
    }

    joinRoom(id: string){
        this.socketService.joinRoom(id);
        this.$scope.roomJoined = id;
    }

    createRoom(){
        this.socketService.joinRoom(this.$scope.roomName);
    }

    ready(){
        this.socketService.ready();
    }

}
