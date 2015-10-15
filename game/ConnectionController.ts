import * as socketIO from 'socket.io';
import { Room } from './Room';
import { Player } from './Player';
import { RoomService } from './RoomService';
//import { MovementController } from './MovementController';

export class ConnectionController {
	private clients:Array<Client> = [];
	
	private roomSrv:RoomService = new RoomService();
	
	constructor(private ioServer: SocketIO.Server) {;
		this.ioServer.on('connection', (socket:SocketIO.Socket) => this.openConnection(socket));
	}
	
	private openConnection(socket:SocketIO.Socket) : void {
		let client:Client = new Client();
		client.socket = socket;
		this.clients.push(client);
		socket.emit('connected');
		
		socket.on('disconnect', () => this.closeConnection(client));
		socket.on('joinroom', (data:{name:string}) => this.roomSrv.joinRoom(client, data));
		socket.on('leaveroom', () => this.roomSrv.leaveRoom(client));
		
		console.log('Connected ' + (this.clients.length - 1));
	}
	
	private closeConnection(client:Client) : void {
		let index:number = this.clients.indexOf(client);
		this.clients.splice(index, 1);
		if(client.player !== undefined) {
			this.roomSrv.leaveRoom(client);
		}
		console.log('Disconnected ' + index);
	}	
	
	public sendToAll(event:string, ...message:any[]) : void {
		this.ioServer.emit(event, message);
	}
	
	public sendToRoom(room:Room, event:string, ...message:any[]) : void {
		this.ioServer.to(room.id).emit(event, message);
	}
}

export class Client {
	public socket:SocketIO.Socket;
	public player:Player;
}