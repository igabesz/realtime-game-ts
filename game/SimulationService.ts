import { Room } from './Room';
import { Player, Position } from './Player';
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
			
			if(player.button.up) {
				player.speed.x += player.ship.acc * Math.cos(player.position.angle);
				player.speed.y += player.ship.acc * Math.sin(player.position.angle);
			}
			if(player.button.down) {
				player.speed.x -= player.ship.acc * Math.cos(player.position.angle);
				player.speed.y -= player.ship.acc * Math.sin(player.position.angle);
			}
			if(player.button.left) {
				player.speed.turn += player.ship.turnacc;
				while(player.speed.turn >= 2 * Math.PI) {
					player.speed.turn -= 2 * Math.PI;
				}
			}
			if(player.button.right) {
				player.speed.turn -= player.ship.turnacc;
				while(player.speed.turn <= 2 * Math.PI) {
					player.speed.turn += 2 * Math.PI;
				}
			}
			
			player.position.x += player.speed.x * deltaTime;
			player.position.y += player.speed.y * deltaTime;
			player.position.angle += player.speed.turn * deltaTime;
			
			while(player.position.angle >= 2 * Math.PI) {
				player.position.angle -= 2 * Math.PI;
			}
			while(player.position.angle <= 2 * Math.PI) {
				player.position.angle += 2 * Math.PI;
			}
		}
	}
	
	private sendPosition(room:Room) {
		let response:Array<PositionResponse> = []; 
		for(let i:number = 0; i < room.players.length; i++) {
			let player:Player = room.players[i];
			response.push({
				name: 'asd', // TO-DO add client name
				position: player.position
			});
		}
		this.connectionController.sendToRoom(room, 'position', response);
	}
}
