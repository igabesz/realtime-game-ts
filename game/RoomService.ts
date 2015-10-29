import { Room } from './Room';
import { Player } from './Player';
import { Client, ConnectionController } from './ConnectionController';
import { JOIN_ROOM_EVENT, LEAVE_ROOM_EVENT, START_ROOM_EVENT, JoinRoomRequest, Response } from '../common/Message';

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
		let response:Response = new Response();
		// validation
		// if the player is in a room
		if(client.isInRoom()) {
			response.errors.push('You are already in a room');
		}
		else {
			// join
			let room:Room = this.findRoomByName(request.roomName);
			
			// check if the room exists
			if(room === undefined) {
				room = new Room(request.roomName, client.player);
				this.rooms.push(room);
			}
			// check if the room is already started
			if(room.started) {
				response.errors.push('The room is already started');
		
			}
			// add player to the room
			else {
				room.players.push(client.player);
				client.player.room = room;
				client.socket.join(request.roomName);
			}
		}
		this.connectionCtrl.sendToClient(client, JOIN_ROOM_EVENT, response);
	}
	
	public leaveRoom(client:Client) : void {
		let response:Response = new Response();
		// validation
		// if the player is in a room
		if(!client.isInRoom()) {
			response.errors.push('You are not in a room yet');
		}
		else {
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
		this.connectionCtrl.sendToClient(client, JOIN_ROOM_EVENT, response);
	}
	
	private startRoom(client:Client) {
		let response:Response = new Response();
		if(!client.isInRoom()) {
			response.errors.push('You are not in a room yet');
		}
		else {
			let room:Room = client.player.room;
			if(room.started) {
				response.errors.push('The room is already started');
			}
			else if(room.host === client.player) {
				response.errors.push('You are not the host');
			}
			else {
				room.started = true;
			}
		}
		this.connectionCtrl.sendToClient(client, JOIN_ROOM_EVENT, response);
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
