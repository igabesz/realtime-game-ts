import { Player } from '../common/Player';
import { ShipType, GeneralShip, Speed, Position } from '../common/GameObject';
import { Response } from '../common/Message';
import { Room, ListRoomItem, LIST_ROOM_EVENT, JOIN_ROOM_EVENT, LEAVE_ROOM_EVENT, START_ROOM_EVENT, READY_ROOM_EVENT, JoinRoomRequest, ReadyRoomRequest, ListRoomResponse } from '../common/Room';

import { Client, ConnectionController } from './ConnectionController';

export class RoomService {
	private rooms: Array<Room> = [];
	
	constructor(private connectionCtrl: ConnectionController) { }
	
	public listRoom(client: Client): void {
		let response: ListRoomResponse = new ListRoomResponse();
		
		for(let i: number = 0; i < this.rooms.length; i++) {
			let item: ListRoomItem = new ListRoomItem();
			item.id = this.rooms[i].id;
			item.playerCount = this.rooms[i].players.length;
		}
		
		this.connectionCtrl.sendToClient(client, LIST_ROOM_EVENT, response);
	}
	
	public joinRoom(client: Client, request: JoinRoomRequest): void {
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
				room.started = false;
				this.rooms.push(room);
			}
			if(room.started) {
				response.errors.push('The room is already started');
		
			}
			// add player to the room
			else {
				room.players.push(client.player);
				client.player.room = room;
				client.lifeCycle.joinRoom();
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
			client.lifeCycle.leaveRoom();
			client.player.room = undefined;
		}
		this.connectionCtrl.sendToClient(client, LEAVE_ROOM_EVENT, response);
	}
	
	public ready(client: Client, request: ReadyRoomRequest): void {
		let response: Response = new Response();
		
		switch(request.shipType) {
			case ShipType.general:
				client.player.ship = new GeneralShip();
				break;
			default:
				response.errors.push('Invalid ship type');
				break;
		}
		if(response.success) {
			client.lifeCycle.readyRoom();
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
	
	public startRoom(client: Client): void {
		let response: Response = new Response();
		if(!client.isInRoom()) {
			response.errors.push('You are not in a room yet');
		}
		else {
			let room: Room = client.player.room;
			if(room.host !== client.player) {
				response.errors.push('You are not the host');
			}
			else {
				let error: string = this.getStartError(room);
				if(error !== '') {
					response.errors.push(error);
				}
				else {
					this.initRoom(room);
					client.lifeCycle.startGame();
				}
			}
		}
		this.connectionCtrl.sendToClient(client, START_ROOM_EVENT, response);
	}
	
	private initRoom(room: Room): void {
		let players: Array<Player> = room.players;
		for(let i: number = 0; i < players.length; i++) {
			let player: Player = players[i];
			player.ship.speed = new Speed();
			player.ship.position = new Position();
			player.ship.speed.x = 0;
			player.ship.speed.y = 0;
			player.ship.speed.turn = 0;
			player.ship.position.x = 0;
			player.ship.position.y = 0;
			player.ship.position.angle = 0;
		}
		room.started = true;
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
