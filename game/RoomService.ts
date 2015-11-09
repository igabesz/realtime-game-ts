import { Player } from '../common/Player';
import { ShipType, GeneralShip, FastShip, Speed, Position } from '../common/GameObject';
import { Response } from '../common/Message';
import { Room, ListRoomItem, LIST_ROOM_EVENT, JOIN_ROOM_EVENT, ROOM_STATE_EVENT, LEAVE_ROOM_EVENT, START_ROOM_EVENT, READY_ROOM_EVENT, LIST_SHIP_EVENT, JoinRoomRequest, ReadyRoomRequest, ListRoomResponse, ListShipsResponse, RoomStateMessage } from '../common/Room';

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
	
	public listShips(client: Client): void {
		let response: ListShipsResponse = new ListShipsResponse();
		
		response.ships.push(new GeneralShip());
		response.ships.push(new FastShip());
		
		this.connectionCtrl.sendToClient(client, LIST_SHIP_EVENT, response);
	}
	
	private sendRoomState(room: Room): void {
		let rsm: RoomStateMessage = new RoomStateMessage();
		
		for(let i: number = 0; i < room.players.length; i++) {
			let player: Player = new Player();
			player.name = room.players[i].name;
			player.ship = room.players[i].ship;
			rsm.players.push(player);
		}
		
		rsm.hostname = room.host.name;
		
		this.connectionCtrl.sendToRoom(room, ROOM_STATE_EVENT, rsm);
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
				this.sendRoomState(room);
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
			this.sendRoomState(room);
		}
		this.connectionCtrl.sendToClient(client, LEAVE_ROOM_EVENT, response);
	}
	
	public ready(client: Client, request: ReadyRoomRequest): void {
		let response: Response = new Response();
		
		switch(request.shipType) {
			case ShipType.general:
				client.player.ship = new GeneralShip();
				break;
			case ShipType.fast:
				client.player.ship = new FastShip();
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
					client.lifeCycle.startGame(); // TO-DO for each player
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
			player.ship.speed.x = i * 50;
			player.ship.speed.y = i * 50;
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
