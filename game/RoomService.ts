import { Room } from './Room';
import { Player } from './Player';
import { Client, ConnectionController } from './ConnectionController';
import { JOIN_ROOM_EVENT, LEAVE_ROOM_EVENT, START_ROOM_EVENT, JoinRoomRequest } from '../common/Message';

export class RoomService {
	private rooms:Array<Room> = [];
	
	constructor(private connectionCtrl:ConnectionController) { }
	
	public addListeners(client:Client) {
		client.socket.on(JOIN_ROOM_EVENT, (request:JoinRoomRequest) => this.joinRoom(client, request));
		client.socket.on(START_ROOM_EVENT, () => this.startRoom(client));
		client.socket.on(LEAVE_ROOM_EVENT, () => this.leaveRoom(client));
	}
	
	public removeListeners(client:Client) {
		client.socket.removeAllListeners(JOIN_ROOM_EVENT);
		client.socket.removeAllListeners(START_ROOM_EVENT);
		client.socket.removeAllListeners(LEAVE_ROOM_EVENT);
	}
	
	private joinRoom(client:Client, request:JoinRoomRequest) : void {
		// validation
		// if the player is in a room
		if(client.isInRoom()) {
			this.connectionCtrl.sendToClient(client, JOIN_ROOM_EVENT, 'You are already in a room');
			return;
		}
		
		// join
		let room:Room = this.findRoomByName(request.roomName);
		
		// check if the room exists
		if(room === undefined) {
			client.player = new Player();
			room = new Room(request.roomName, client.player);
			this.rooms.push(room);
			console.log(client.name + ' created a new room: ' + room.id);
				this.connectionCtrl.sendToClient(client, JOIN_ROOM_EVENT, 'You have created a new room:' + room.id);
		}
		else {
			// check if the room is already started
			if(room.started) {
				console.log(room.id + ' is already started');
				this.connectionCtrl.sendToClient(client, JOIN_ROOM_EVENT, 'The room is already started');
				return;
			}
			client.player = new Player();
			room.players.push(client.player);
		}
		// add player to the room
		client.player.room = room;
		client.socket.join(request.roomName);
	}
	
	public leaveRoom(client:Client) : void {
		// validation
		// if the player is in a room
		if(!client.isInRoom()) {
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
	}
	
	private startRoom(client:Client) {
		if(!client.isInRoom()) {
			return;
		}
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
