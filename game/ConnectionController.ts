import * as socketIO from 'socket.io';
import { Room } from './Room';
import { Player } from './Player';
import { RoomService } from './RoomService';
import { SimulationService } from './SimulationService';
import { MovementController } from './MovementController';

/** 
 * This is the main controller
 * Manages the sockets, and other controllers
 */
export class ConnectionController {
	private clients:Array<Client> = [];
	private clientid:number = 0;
	
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
		client.name = 'Player ' + this.clientid;
		this.clientid++;
		
		// add handlers
		socket.on('disconnect', () => this.closeConnection(client));
		socket.on('personalinfo', (data:{name:string}) => this.personalInfo(client, data));
		this.roomService.addHandlers(client);
		this.movementController.addHandlers(client);
		
		// welcome user
		this.sendToClient(client, 'login', 'Login success');
		console.log('Connected ' + client.name);
	}
	
	private closeConnection(client:Client) : void {
		// remove client
		let index:number = this.clients.indexOf(client);
		this.clients.splice(index, 1);
		if(client.player !== undefined) {
			this.roomService.leaveRoom(client);
		}
		console.log('Disconnected ' + client.name);
	}
	
	private personalInfo(client:Client, data:{name:string}) : void {
		client.name = data.name;
	}
	
	public sendToAll(event:string, ...message:any[]) : void {
		this.ioServer.emit(event, message);
		/** Test only */
		this.ioServer.emit('test', { title:'All ' + event, body: message});
	}
	
	public sendToRoom(room:Room, event:string, ...message:any[]) : void {
		this.ioServer.to(room.id).emit(event, message);
		/** Test only */
		this.ioServer.to(room.id).emit('test', { title:'Room ' + event, body: message});
	}
	
	public sendToClient(client:Client, event:string, ...message:any[]) : void {
		client.socket.emit(event, message);
		/** Test only */
		client.socket.emit('test', { title:'Client ' + event, body: message});
	}
}

export class Client {
	public name:string;
	public socket:SocketIO.Socket;
	public player:Player;
}