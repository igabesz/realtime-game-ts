import * as socketIO from 'socket.io';

import { Room } from '../common/Room';
import { Player } from '../common/Player';
import { Message, Response } from '../common/Message';
import { PersonalInfoRequest, PersonalInfoResponse, PERSONAL_INFO_EVENT} from '../common/Connection';

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
	
	constructor(private ioServer: SocketIO.Server) {
		// waits for connection
		this.ioServer.on('connection', (socket: SocketIO.Socket) => this.openConnection(socket));
	}
	
	private openConnection(socket: SocketIO.Socket): void {
		// save the client
		let client: Client = new Client();
		client.socket = socket;
		this.clients.push(client);
		console.log('Connected', this.clients.map(c => c.player ? c.player.name : 'unknown'));
		
		// add listeners
		socket.on('disconnect', () => this.closeConnection(client));
		socket.on(PERSONAL_INFO_EVENT, (data: PersonalInfoRequest) => this.personalInfo(client, data));
	}
	
	private closeConnection(client: Client): void {
		// remove client
		let index: number = this.clients.indexOf(client);
		this.clients.splice(index, 1);
		if(client.isInRoom()) {
			this.roomService.leaveRoom(client);
		}
	}
	
	private personalInfo(client: Client, data: PersonalInfoRequest): void {
		// save data
		client.player = new Player();
		client.player.name = data.token; // TO-DO add logic from login server
		
		// response
		let response: PersonalInfoResponse = new PersonalInfoResponse(); 
		response.name = client.player.name;
		this.sendToClient(client, PERSONAL_INFO_EVENT, response);
		
		// refresh listeners
		client.removeListener(PERSONAL_INFO_EVENT);
		this.roomService.addListeners(client);
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
	
	public getClients(): Array<Client> {
		return this.clients;
	}
}

export class Client {
	public socket: SocketIO.Socket;
	public player: Player;
	
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
