import { Room } from './Room';
import { Player, } from './Player';
import { RoomService } from './RoomService';
import { ConnectionController } from './ConnectionController';
import { Position, PlayerPosition, PositionResponse, POSITION_EVENT } from '../common/Message';

export class SimulationService {
	private timer:NodeJS.Timer;
	private time:Date = new Date();
	
	constructor(private roomService:RoomService, private connectionController:ConnectionController) {
		// start timer
		this.timer = setInterval(() => this.step(), 20);
	 } 
	
	private step() : void {
		// calculate time since last update
		let now:Date = new Date();
		let deltaTime = (now.getTime() - this.time.getTime());
		this.time = now;
		
		// update every started room then send the new positions
		let rooms:Array<Room> = this.roomService.getRooms();
		for(let i = 0 ; i < rooms.length; i++) {
			let room = rooms[i];
			if(room.started) {
				this.simulateRoom(room, deltaTime);
				this.sendPosition(room);
			}
		}
	}
	
	private simulateRoom(room:Room, deltaTime:number) {
		let players = room.players;
		// for each player
		for(let i = 0 ; i < players.length; i++) {
			let player = players[i];
			
			// calculate speed
			if(player.button.up) {
				player.speed.x += player.ship.acc * Math.cos(player.position.angle);
				player.speed.y += player.ship.acc * Math.sin(player.position.angle);
			}
			if(player.button.down) {
				player.speed.x -= player.ship.acc * Math.cos(player.position.angle);
				player.speed.y -= player.ship.acc * Math.sin(player.position.angle);
			}
			
			// calcluate turn speed
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
			
			// calculate position
			player.position.x += player.speed.x * deltaTime;
			player.position.y += player.speed.y * deltaTime;
			
			// calculate angle
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
		let response:PositionResponse = new PositionResponse();
		for(let i = 0; i < room.players.length; i++) {
			let player = room.players[i];
			let playerPosition = new PlayerPosition();
			playerPosition.name = player.name;
			playerPosition.position = player.position; 
			response.data.push(playerPosition);
		}
		this.connectionController.sendToRoom(room, POSITION_EVENT, response);
	}
}
