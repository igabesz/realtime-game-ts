import { Room } from './Room';
import { Player } from './Player';
import { Client, ConnectionController } from './ConnectionController';

export class RoomService {
	private rooms:Array<Room> = [];
	
	constructor(private connectionCtrl:ConnectionController) { }
	
	public addHandlers(client:Client) {
		client.socket.on('joinroom', (data:{name:string}) => this.joinRoom(client, data));
		client.socket.on('startroom', () => this.startRoom(client));
		client.socket.on('leaveroom', () => this.leaveRoom(client));
	}
	
	public joinRoom(client:Client, data:{name:string}) : void {
		// validation
		// if the player is in a room
		if(client.player !== undefined && client.player.room !== undefined) {
			this.connectionCtrl.sendToClient(client, 'joinroom', 'You are already in a room');
			console.log(client.name + ' is already in a room');
			return;
		}
		
		// join
		let room:Room = this.findRoomByName(data.name);
		
		// check if the room exists
		if(room === undefined) {
			client.player = new Player();
			room = new Room(data.name, client.player);
			this.rooms.push(room);
			console.log(client.name + ' created a new room: ' + room.id);
				this.connectionCtrl.sendToClient(client, 'joinroom', 'You have created a new room:' + room.id);
		}
		else {
			// check if the room is already started
			if(room.started) {
				console.log(room.id + ' is already started');
				this.connectionCtrl.sendToClient(client, 'joinroom', 'The room is already started');
				return;
			}
			client.player = new Player();
			room.players.push(client.player);
			console.log(client.name + ' joined a room: ' + room.id);
		}
		// add player to the room
		client.player.room = room;
		client.socket.join(data.name);
	}
	
	public leaveRoom(client:Client) : void {
		// validation
		// if the player is in a room
		if(client.player === undefined || client.player.room === undefined) {
			console.log(client.name + 'is already in a room');
			return;
		}
		
		// remove from room
		let room:Room = client.player.room;
		room.players.splice(room.players.indexOf(client.player));
		
		// destroy room if empty
		if(room.players.length == 0) {
			this.rooms.splice(this.rooms.indexOf(room));
		}
		// promote new host if needed
		else if(room.host === client.player) {
			room.host = room.players[0];
		}
		// leave room
		client.socket.leave(room.id);
		client.player = undefined;
		console.log(client.name + ' left the room: ' + room.id);
	}
	
	public startRoom(client:Client) {
		let room:Room = client.player.room;
		if(room.started === false && room.host === client.player) {
			room.started = true;
		}
		console.log(room.id + ' has been started')
	}
	
	private findRoomByName(name:string) : Room {
		for(let i:number = 0; i < this.rooms.length; i++) {
			let room:Room = this.rooms[i];
			if(room.id == name) {
				return room;
			}
		}
		return undefined;
	}
	
	public getRooms() : Array<Room> {
		return this.rooms;
	}
}
