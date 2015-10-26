import * as socketIO from 'socket.io';
import { Room } from './Room';
import { Player } from './Player';
import { RoomService } from './RoomService';
import { SimulationService } from './SimulationService';
import { MovementController } from './MovementController';
import { PersonalInfoRequest, PersonalInfoResponse, PERSONAL_INFO_EVENT } from '../common/Message';

/** 
 * This is the main controller
 * Manages the sockets, and other controllers
 */
export class ConnectionController {
	private clients:Array<Client> = [];
	
	private roomService:RoomService = new RoomService(this);
	private simulationService:SimulationService = new SimulationService(this.roomService, this);
	
	private movementController:MovementController = new MovementController();
	
	constructor(private ioServer: SocketIO.Server) {
		// waits for connection
		this.ioServer.on('connection', (socket:SocketIO.Socket) => this.openConnection(socket));
	}
	
	private openConnection(socket:SocketIO.Socket) : void {
		// save the client
		let client:Client = new Client();
		client.socket = socket;
		this.clients.push(client);
		
		// add listeners
		socket.on('disconnect', () => this.closeConnection(client));
		socket.on(PERSONAL_INFO_EVENT, (data:PersonalInfoRequest) => this.personalInfo(client, data));
	}
	
	private closeConnection(client:Client) : void {
		// remove client
		let index:number = this.clients.indexOf(client);
		this.clients.splice(index, 1);
		if(client.isInRoom()) {
			this.roomService.leaveRoom(client);
		}
		console.log('Disconnected ' + client.name);
	}
	
	private personalInfo(client:Client, data:PersonalInfoRequest) : void {
		// save data
		client.name = data.token;
		
		// response
		let response:PersonalInfoResponse = new PersonalInfoResponse(); 
		response.name = client.name;
		this.sendToClient(client, PERSONAL_INFO_EVENT, response);
		
		// refresh listeners
		client.socket.removeAllListeners(PERSONAL_INFO_EVENT);
		this.roomService.addListeners(client);
	}
	
	public sendToAll(event:string, ...message:any[]) : void {
		this.ioServer.emit(event, message);
		/** Test only */
		console.log('All: ' + event);
		this.ioServer.emit('test', { title:'All ' + event, body: message});
	}
	
	public sendToRoom(room:Room, event:string, ...message:any[]) : void {
		this.ioServer.to(room.id).emit(event, message);
		/** Test only */
		console.log('Room ' + room.id + ': ' + event);
		this.ioServer.to(room.id).emit('test', { title:'Room ' + event, body: message});
	}
	
	public sendToClient(client:Client, event:string, ...message:any[]) : void {
		client.socket.emit(event, message);
		/** Test only */
		console.log('Client ' + client.name + ': ' + event);
		client.socket.emit('test', { title:'Client ' + event, body: message});
	}
}

export class Client {
	public name:string;
	public socket:SocketIO.Socket;
	public player:Player;
	
	public isInRoom() : boolean {
		if(this.player === undefined || this.player.room === undefined) {
			return false;
		}
		return true;
	}
}
