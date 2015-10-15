import * as socketIO from 'socket.io';
import { Room } from './Room';
import { Player } from './Player';
import { RoomService } from './RoomService';
//import { MovementController } from './MovementController';

export class ConnectionController {
	private clients:Array<Client> = [];
	private clientid:number = 0;
	
	private roomSrv:RoomService = new RoomService();
	
	constructor(private ioServer: SocketIO.Server) {
		this.ioServer.on('connection', (socket:SocketIO.Socket) => this.openConnection(socket));
	}
	
	private openConnection(socket:SocketIO.Socket) : void {
		let client:Client = new Client();
		client.socket = socket;
		this.clients.push(client);
		socket.emit('connected');
		client.name = 'Player ' + this.clientid;
		this.clientid++;
		
		socket.on('disconnect', () => this.closeConnection(client));
		socket.on('personalinfo', (data:{name:string}) => this.personalInfo(client, data));
		socket.on('joinroom', (data:{name:string}) => this.roomSrv.joinRoom(client, data));
		socket.on('leaveroom', () => this.roomSrv.leaveRoom(client));
		
		console.log('Connected ' + client.name);
	}
	
	private closeConnection(client:Client) : void {
		let index:number = this.clients.indexOf(client);
		this.clients.splice(index, 1);
		if(client.player !== undefined) {
			this.roomSrv.leaveRoom(client);
		}
		console.log('Disconnected ' + client.name);
	}
	
	private personalInfo(client:Client, data:{name:string}) : void {
		client.name = data.name;
		console.log('Client renamed to "' + client.name + '"');
	}
	
	public sendToAll(event:string, ...message:any[]) : void {
		this.ioServer.emit(event, message);
	}
	
	public sendToRoom(room:Room, event:string, ...message:any[]) : void {
		this.ioServer.to(room.id).emit(event, message);
	}
}

export class Client {
	public name:string;
	public socket:SocketIO.Socket;
	public player:Player;
}