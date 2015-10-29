import { Player } from '../common/Player';
import { ShipType, GeneralShip } from '../common/GameObject';
import { Response } from '../common/Message';
import { Room, JOIN_ROOM_EVENT, LEAVE_ROOM_EVENT, START_ROOM_EVENT, READY_ROOM_EVENT, JoinRoomRequest, ReadyRoomRequest } from '../common/Room';

import { Client, ConnectionController } from './ConnectionController';

export class RoomService {
	private rooms: Array<Room> = [];
	
	constructor(private connectionCtrl: ConnectionController) { }
	
	public addListeners(client: Client): void {
		client.socket.on(JOIN_ROOM_EVENT, (request: JoinRoomRequest) => this.joinRoom(client, request));
		client.socket.on(LEAVE_ROOM_EVENT, () => this.leaveRoom(client));
		client.socket.on(READY_ROOM_EVENT, (request: ReadyRoomRequest) => this.ready(client, request));
		client.socket.on(START_ROOM_EVENT, () => this.startRoom(client));
	}
	
	public removeListeners(client:Client): void {
		client.removeListener(JOIN_ROOM_EVENT);
		client.removeListener(LEAVE_ROOM_EVENT);
		client.removeListener(READY_ROOM_EVENT);
		client.removeListener(START_ROOM_EVENT);
	}
	
	private joinRoom(client: Client, request: JoinRoomRequest): void {
		let response: Response = new Response();
		
		if(client.isInRoom()) {
			response.errors.push('You are already in a room');
		}
		else {
			let room: Room = this.findRoomByName(request.roomName);
			
			// check if the room exists
			if(room === undefined) {
				room = new Room();
				room.id = request.roomName;
				room.host = client.player;
				this.rooms.push(room);
			}
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
	
	public leaveRoom(client: Client): void {
		let response: Response = new Response();
		
		if(!client.isInRoom()) {
			response.errors.push('You are not in a room yet');
		}
		else {
			let room: Room = client.player.room;
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
			client.player.room = undefined;
		}
		this.connectionCtrl.sendToClient(client, JOIN_ROOM_EVENT, response);
	}
	
	private ready(client: Client, request: ReadyRoomRequest): void {
		let response: Response = new Response();
		
		switch(request.shipType) {
			case ShipType.general:
				client.player.ship = new GeneralShip();
				break;
			default:
				response.errors.push('Invalid ship type');
				break;
		}
		
		this.connectionCtrl.sendToClient(client, READY_ROOM_EVENT, response);
	} 
	
	private getStartError(room: Room): string {
		if(room === undefined) {
			return 'FATAL ERROR! Undefined room';
		}
		if(room.started) {
			return 'The room is already started';
		}
		if(room.players.length < 2){
			return 'Too few players to start';
		}
		for(let i: number = 0; i < room.players.length; i++) {
			let player: Player = room.players[i];
			if(player.ship === undefined) {
				return player.name + ' is not ready yet';
			}
		}
		return '';
	}
	
	private startRoom(client: Client) {
		let response: Response = new Response();
		if(!client.isInRoom()) {
			response.errors.push('You are not in a room yet');
		}
		else {
			let room: Room = client.player.room;
			if(room.host === client.player) {
				response.errors.push('You are not the host');
			}
			else {
				let error: string = this.getStartError(room);
				if(error !== '') {
					response.errors.push(error);
				}
				else {
					room.started = true;
					// TO-DO other game initalization
				}
			}
		}
		this.connectionCtrl.sendToClient(client, JOIN_ROOM_EVENT, response);
	}
	
	private findRoomByName(name: string): Room {
		for(let i: number = 0; i < this.rooms.length; i++) {
			let room: Room = this.rooms[i];
			if(room.id == name) {
				return room;
			}
		}
		return undefined;
	}
	
	public getRooms(): Array<Room> {
		return this.rooms;
	}
}
