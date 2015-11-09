import { SocketService } from './SocketService';
import * as _ from 'lodash';
import { PERSONAL_INFO_EVENT } from '../common/Connection';
import { LIST_ROOM_EVENT } from '../common/Room';
import { ListRoomItem } from '../common/Room';
import { JOIN_ROOM_EVENT } from '../common/Room';


/**Extending IScope with the custom properties off the current $scope */
interface IMainScope extends ng.IScope {
	player: {
		x: number,
		y: number
	};

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
        var a = new ListRoomItem();
        var b = new ListRoomItem();
        a.id="alma";
        a.playerCount = 5;
        b.playerCount = 10;
        b.id="heydude";
        rooms.push(a);
        rooms.push(b);
        this.$scope.rooms = rooms;
    }

    joinRoom(id: string){
        this.socketService.joinRoom(id);
    }
}
