import * as socketIO from 'socket.io';

import { Room } from '../common/Room';
import { Player } from '../common/Player';
import { Message, Response, AllChatMessage } from '../common/Message';
import { PersonalInfoRequest, PingRequest, PersonalInfoResponse, PongResponse, PERSONAL_INFO_EVENT, PING_PONG_EVENT} from '../common/Connection';

import { IDatabase, DatabaseResponse, Status } from '../database/Database';
import { User } from '../database/User';

import { LifeCycle } from './LifeCycle';
import { RoomService } from './RoomService';
import { SimulationService } from './SimulationService';
import { MovementController } from './MovementController';

/** 
 * This is the main controller
 * Manages the sockets, and other controllers
 */
export class ConnectionController {
	private clients: Array<Client> = [];
	
	private roomService: RoomService = new RoomService(this);
	private simulationService: SimulationService = new SimulationService(this.roomService, this);
	private movementController: MovementController = new MovementController();
	
	constructor(private ioServer: SocketIO.Server, private database: IDatabase) {
		// waits for connection
		this.ioServer.on('connection', (socket: SocketIO.Socket) => this.openConnection(socket));
	}
	
	private openConnection(socket: SocketIO.Socket): void {
		// save the client
		let client: Client = new Client();
		client.socket = socket;
		this.clients.push(client);
		console.log('Connected', this.clients.map(c => c.player ? c.player.name : 'unknown'));
		
		client.lifeCycle = new LifeCycle(client, this, this.roomService, this.movementController);
		client.lifeCycle.openConnection();
	}
	
	public closeConnection(client: Client): void {
		// remove client
		let index: number = this.clients.indexOf(client);
		this.clients.splice(index, 1);
		if(client.isInRoom()) {
			this.roomService.leaveRoom(client);
		}
		client.lifeCycle.disconnect();
        // TO-DO delete token from db
	}
	
	public responseTime(client: Client, request: PingRequest) {
		let response: PongResponse = new PongResponse();
		response.time = request.time;
		this.sendToClient(client, PING_PONG_EVENT, response);
	}
	
	public personalInfo(client: Client, request: PersonalInfoRequest): void {
		this.database.validateToken(request.token, (response: DatabaseResponse) => this.savePersonalInfo(client, response));
	}
	
	private savePersonalInfo(client: Client, data: DatabaseResponse): void {
		let response: PersonalInfoResponse = new PersonalInfoResponse();
		if(data.status === Status.success) {
			let user: User = data.data;
			
			if(!user.isAdmin) {
				// save data
				client.player = new Player();
				client.player.name = data.data.username;
				
				// response
				response.name = client.player.name;
				
				// refresh listeners
				client.lifeCycle.connect();
			}
			else {
				response.errors.push('Admin login');
			}
		}
		else {
			response.errors.push(data.msg);
		}
		this.sendToClient(client, PERSONAL_INFO_EVENT, response);
	}
	
	public sendToAll(event: string, message: Message): void {
		this.ioServer.emit(event, message);
		/** Test only */
		console.log('All: ' + event);
		this.ioServer.emit('test', { title:'All ' + event, body: message});
	}
	
	public sendToRoom(room: Room, event: string, message: Message): void {
		this.ioServer.to(room.id).emit(event, message);
		/** Test only */
		console.log('Room ' + room.id + ': ' + event);
		this.ioServer.to(room.id).emit('test', { title:'Room ' + event, body: message});
	}
	
	public sendToClient(client: Client, event: string, message: Message): void {
		client.socket.emit(event, message);
		/** Test only */
		let name: string = client.player === undefined ? '' : client.player.name;
		console.log('Client ' + name + ': ' + event);
		client.socket.emit('test', { title:'Client ' + event, body: message});
	}
	
	public getClient(player: Player): Client {
		for(let i: number = 0; i < this.clients.length; i++) {
			if(this.clients[i].player !== undefined && this.clients[i].player === player) {
				return this.clients[i];
			}
		}
	}
	
	public getClients(): Array<Client> {
		return this.clients;
	}
	
	public getRooms(): Array<Room> {
		return this.roomService.getRooms();
	}
	
	public stopServer(): void {
		let message: AllChatMessage = new AllChatMessage();
		message.message = 'Server stopped by an admin'; 
		this.sendToAll('admin', message);
		
	}
}

export class Client {
	public socket: SocketIO.Socket;
	public player: Player;
	public lifeCycle: LifeCycle;
	
	public isInRoom(): boolean {
		if(this.player === undefined || this.player.room === undefined) {
			return false;
		}
		return true;
	}
	
	public removeListener(event: string): void {
		let listeners: Array<Function> = this.socket.listeners(event);
		while(listeners.length > 0) {
			this.socket.removeListener(event, listeners.pop());
		}
	} 
}
