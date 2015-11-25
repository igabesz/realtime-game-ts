import { PersonalInfoRequest, PingRequest, PERSONAL_INFO_EVENT, PING_PONG_EVENT} from '../common/Connection';
import { JoinRoomRequest, ReadyRoomRequest, LIST_ROOM_EVENT, LIST_SHIP_EVENT, JOIN_ROOM_EVENT, LEAVE_ROOM_EVENT, START_ROOM_EVENT, READY_ROOM_EVENT} from '../common/Room';
import { MovementRequest, FireRequest, MOVEMENT_EVENT, FIRE_EVENT } from '../common/Movement';

import { Client, ConnectionController } from './ConnectionController';
import { RoomService } from './RoomService';
import { MovementController } from './MovementController';

export enum LifeCycleState {
	ConnectionOpen,
	Connected,
	Room,
	RoomReady,
	Game,
	GameDead,
	Disconnected
}

export class LifeCycle {
	private state: LifeCycleState = null;
	public constructor(private client: Client, private connectionController: ConnectionController, private roomService: RoomService, private movementController: MovementController) { }
	
	public get State(): LifeCycleState {
		return this.state;
	}
	
	public openConnection(): void {
		if(this.state === null) {
			this.client.socket.on('disconnect', () => this.connectionController.closeConnection(this.client));
			this.client.socket.on(PING_PONG_EVENT, (request: PingRequest) => this.connectionController.responseTime(this.client, request));
			this.client.socket.on(PERSONAL_INFO_EVENT, (data: PersonalInfoRequest) => this.connectionController.personalInfo(this.client, data));
			
			this.state = LifeCycleState.ConnectionOpen;
		}
	}
	
	public connect(): void {
		if(this.state === LifeCycleState.ConnectionOpen) {
			this.client.removeListener(PERSONAL_INFO_EVENT);
			
			this.client.socket.on(LIST_ROOM_EVENT, () => this.roomService.listRoom(this.client));
			this.client.socket.on(JOIN_ROOM_EVENT, (request: JoinRoomRequest) => this.roomService.joinRoom(this.client, request));
			
			this.state = LifeCycleState.Connected;
		}
	}
	
	public joinRoom(): void {
		if(this.state === LifeCycleState.Connected) {
			this.client.removeListener(LIST_ROOM_EVENT);
			this.client.removeListener(JOIN_ROOM_EVENT);
			
			this.client.socket.on(LEAVE_ROOM_EVENT, () => this.roomService.leaveRoom(this.client));
			this.client.socket.on(READY_ROOM_EVENT, (request: ReadyRoomRequest) => this.roomService.ready(this.client, request));
			this.client.socket.on(LIST_SHIP_EVENT, () => this.roomService.listShips(this.client));
			
			this.client.socket.join(this.client.player.room.id);
			
			this.state = LifeCycleState.Room;
		}
	}
	
	public leaveRoom() {
		if(this.state === LifeCycleState.Room || this.state === LifeCycleState.RoomReady || this.state === LifeCycleState.Game || this.state === LifeCycleState.GameDead) {
			this.client.removeListener(LEAVE_ROOM_EVENT);
			this.client.removeListener(READY_ROOM_EVENT);
			this.client.removeListener(START_ROOM_EVENT);
			
			this.client.socket.on(LIST_ROOM_EVENT, () => this.roomService.listRoom(this.client));
			this.client.socket.on(JOIN_ROOM_EVENT, (request: JoinRoomRequest) => this.roomService.joinRoom(this.client, request));
			
			this.client.socket.leave(this.client.player.room.id);
			
			this.state = LifeCycleState.Connected;
		}
	}
	
	public readyRoom(): void {
		if(this.state === LifeCycleState.Room) {
			this.client.removeListener(READY_ROOM_EVENT);
			this.client.removeListener(LIST_SHIP_EVENT);
			
			this.client.socket.on(START_ROOM_EVENT, () => this.roomService.startRoom(this.client));
			
			this.state = LifeCycleState.RoomReady;
		}
	}
	
	public startGame(): void {
		if(this.state === LifeCycleState.RoomReady) {
			this.client.removeListener(READY_ROOM_EVENT);
			this.client.removeListener(START_ROOM_EVENT);
			
			this.client.socket.on(MOVEMENT_EVENT, (request: MovementRequest) => this.movementController.move(this.client, request));
			this.client.socket.on(FIRE_EVENT, (request: FireRequest) => this.movementController.fire(this.client, request));
			
			this.state = LifeCycleState.Game;	
		}
	}
	
	public die(): void {
		if(this.state == LifeCycleState.Game) {
			this.client.removeListener(MOVEMENT_EVENT);
			this.client.removeListener(FIRE_EVENT);
			
			this.state = LifeCycleState.GameDead;
			// currently there is not dead state
			this.leaveRoom();
		}
	}
	
	public disconnect(): void {
		if(this.state === LifeCycleState.Disconnected) {
			return;
		}
		
		this.client.removeListener(MOVEMENT_EVENT);
		this.client.removeListener(FIRE_EVENT);
		
		this.client.removeListener(START_ROOM_EVENT);
		
		this.client.removeListener(LEAVE_ROOM_EVENT);
		this.client.removeListener(READY_ROOM_EVENT);
		this.client.removeListener(LIST_SHIP_EVENT);
		
		this.client.removeListener(LIST_ROOM_EVENT);
		this.client.removeListener(JOIN_ROOM_EVENT);
		
		this.client.removeListener(PERSONAL_INFO_EVENT);
		this.client.removeListener(PING_PONG_EVENT);
		this.client.removeListener('disconnect');
		
		this.state = LifeCycleState.Disconnected;
	}
}