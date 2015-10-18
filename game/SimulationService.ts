import { Room } from './Room';
import { Player } from './Player';
import { Position } from './Position';
import { RoomService } from './RoomService';
import { ConnectionController } from './ConnectionController';

class PositionResponse {
	public name:string;
	public position:Position;
}

export class SimulationService {
	private timer:NodeJS.Timer;
	private time:Date = new Date();
	
	constructor(private roomService:RoomService, private connectionController:ConnectionController) {
		this.timer = setInterval(() => this.step(), 20);
	 } 
	
	private step() : void {
		let now:Date = new Date();
		let deltaTime:number = (now.getTime() - this.time.getTime());
		this.time = now;
		
		let rooms:Array<Room> = this.roomService.getRooms();
		for(let i:number = 0 ; i < rooms.length; i++) {
			let room:Room = rooms[i];
			if(room.started) {
				this.simulateRoom(room, deltaTime);
				this.sendPosition(room);
			}
		}
	}
	
	private simulateRoom(room:Room, deltaTime:number) {
		let players:Player[] = room.players;
		for(let i:number = 0 ; i < players.length; i++) {
			let player:Player = players[i];
			
			// TO-DO speed calc
			
			player.position.x += player.speed.x * deltaTime;
			player.position.y += player.speed.y * deltaTime;
			player.position.angle += player.speed.angle * deltaTime;
		}
	}
	
	private sendPosition(room:Room) {
		let response:Array<PositionResponse> = []; 
		for(let i:number = 0; i < room.players.length; i++) {
			let player:Player = room.players[i];
			response.push({
				name: 'asd',
				position: player.position
			});
		}
		this.connectionController.sendToRoom(room, 'position', response);
	}
}
