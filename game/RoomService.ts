import { Room } from './Room';
import { Player } from './Player';
import { Client } from './ConnectionController';

export class RoomService {
	private rooms:Array<Room> = [];
	
	constructor() { }
	
	public joinRoom(client:Client, data:{name:string}) : void {
		let room:Room = this.findRoomByName(data.name);
		client.player = new Player();
		if(room === undefined) {
			room = new Room(data.name, client.player);
			this.rooms.push(room);
			console.log(client.name + ' created a new room: ' + room.id);
		}
		else {
			room.players.push(client.player);
			console.log(client.name + ' joined a room: ' + room.id);
		}
		client.player.room = room;
		client.socket.join(data.name);
	}
	
	public leaveRoom(client:Client) : void {
		let room:Room = client.player.room;
		if(room === undefined) {
			// error
		}
		room.players.splice(room.players.indexOf(client.player));
		if(room.players.length == 0) {
			this.rooms.splice(this.rooms.indexOf(room));
		}
		else if(room.host === client.player) {
			room.host = room.players[0];
		}
		client.socket.leave(room.id);
		client.player.room = undefined;
		console.log(client.name + ' left the room: ' + room.id);
	}
	
	public startRoom(client:Client) {
		let room:Room = client.player.room;
		if(room.started === false && room.host === client.player) {
			room.started = true;
		}
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
