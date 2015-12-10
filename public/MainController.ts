import { SocketService } from './SocketService';
import * as _ from 'lodash';
import { PERSONAL_INFO_EVENT } from '../common/Connection';
import { LIST_ROOM_EVENT, JOIN_ROOM_EVENT, ListRoomItem, LIST_SHIP_EVENT, ListShipsResponse, START_ROOM_EVENT,READY_ROOM_EVENT, ROOM_STATE_EVENT, QUIT_ROOM_EVENT } from '../common/Room';
import { Ship, ShipType } from '../common/GameObject';
import { SpaceGame } from './game/SpaceGame';
import { Response } from '../common/Message';
import { Player } from '../common/Player';


/**Extending IScope with the custom properties off the current $scope */
interface IMainScope extends ng.IScope {
    rooms: Array<ListRoomItem>;
    ships: Array<any>;
    players: Array<Player>;
    username: string;
    roomLobbyView: boolean;
    inRoomView: boolean;
    gameView: boolean;
    roomName: string;
    roomJoined: string;
    areRoomsAlreadyListed: boolean;
    hostname: string;
    isHost: boolean;
    isReady: boolean;
    choosedShip: string;
    game: SpaceGame;

}


export class MainController {
	/**This is required if the project is minified so that the parameters in the 
	 * constructor are shortened thus Angular won't know what is requested 
	 */
	static $inject = ['$scope', '$timeout', 'SocketService'];

    private timer;

	/**Constructor parameters are resolved by the $inject static member 
	 * using the already registered Angular services
	 */
	constructor(
		private $scope: IMainScope,
		private $timeout: ng.ITimeoutService,
		private socketService: SocketService
	) {
        this.init($scope);

		socketService.connect();

        socketService.addHandler(PERSONAL_INFO_EVENT, $timeout, (msg: Response) => {
            console.info("PERSONAL_INFO_EVENT ", msg);
            if(msg.errors.length === 0) {
                this.socketService.listRooms();
                this.$scope.username = sessionStorage["user"];
                this.timer = setInterval(() => {
                    this.refreshRooms()
                }, 5000);
            } else {
                this.logout();
            }
        });

        socketService.addHandler(LIST_ROOM_EVENT, $timeout, (msg) => {
            console.info("LIST_ROOM_EVENT ", msg);
            this.$scope.rooms = msg.rooms;
        });

        socketService.addHandler(LIST_SHIP_EVENT, $timeout, (msg) => {
            console.info("LIST_SHIP_EVENT ", msg);

            $scope.roomLobbyView = false;
            $scope.inRoomView = true;

            $scope.ships = msg.ships;
            for(var s in $scope.ships){
                $scope.ships[s].type = ShipType[$scope.ships[s].type];
            }
        });

        socketService.addHandler(READY_ROOM_EVENT, $timeout, (msg) => {
            console.info("READY_ROOM_EVENT ", msg);

            this.socketService.start();
        });

        socketService.addHandler(QUIT_ROOM_EVENT, $timeout, (msg) => {
            console.info("QUIT_ROOM_EVENT ", msg);

            $scope.game.destroy();
            this.init(this.$scope);
        });

        socketService.addHandler(ROOM_STATE_EVENT, $timeout, (msg) => {
            console.info("ROOM_STATE_EVENT ", msg);

            if(msg.started === true) {
                $scope.game = new SpaceGame(socketService, msg.size, msg.healthDecay);

                $scope.roomLobbyView = false;
                $scope.inRoomView = false;
                $scope.gameView = true;

                console.log("Game started!");
                return;
            }

            if(! $scope.areRoomsAlreadyListed){
                this.socketService.listShips();
                $scope.areRoomsAlreadyListed = true;
            }

            if("hostname" in msg) {
                this.$scope.hostname = msg.hostname;
                if(this.$scope.hostname === this.$scope.username){
                    $scope.isHost = true;
                } else {
                    $scope.isHost = false;
                }
            }

            if("players" in msg) {
                this.$scope.players = [];
                for (var p in msg.players) {
                    if("hostname" in msg && msg.players[p].name == msg.hostname){
                        msg.players[p].name += " (Host)";
                        this.$scope.players.push(msg.players[p]);
                    } else {
                        this.$scope.players.push(msg.players[p]);
                    }
                }
            }

            this.checkAllReady();
        });

        this.socketService.getPersonalInfo(sessionStorage['token']);
	}

    joinRoom(id: string){
        this.$scope.roomJoined = id;
        this.socketService.joinRoom(id);
    }

    createRoom(){
        this.socketService.joinRoom(this.$scope.roomName);
        this.$scope.roomJoined = this.$scope.roomName;
    }

    ready(shipType){
        this.socketService.ready(shipType);
        this.$scope.choosedShip = shipType;
    }

    leaveRoom(){
        this.socketService.leaveRoom();
        this.init(this.$scope);
        this.socketService.listRooms();
    }

    refreshRooms(){
        this.socketService.listRooms();
    }

    start(){
        this.socketService.start();
    }

    logout(){
        sessionStorage["token"] = "";
        sessionStorage["user"] = "";
        window.location.href = "/";
    }

    checkAllReady(){
        for(var p in this.$scope.players){
            if(this.$scope.players[p].ship === undefined){
                this.$scope.isReady = false;
                return;
            }
        }
        this.$scope.isReady = true;
    }

    init($scope){
        $scope.rooms = [];
        $scope.ships = [];
        $scope.players = [];
        $scope.username = sessionStorage["user"];
        $scope.roomLobbyView = true;
        $scope.inRoomView = false;
        $scope.gameView = false;
        $scope.roomName = "";
        $scope.roomJoined = "";
        $scope.areRoomsAlreadyListed = false;
        $scope.hostname = "";
        $scope.isHost = false;
        $scope.isReady = false;
        $scope.choosedShip = "";
    }


}
