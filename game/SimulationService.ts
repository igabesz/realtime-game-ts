import { Room } from '../common/Room';
import { Player } from '../common/Player';
import { Projectile } from '../common/GameObject';
import { SimulationResponse, POSITION_EVENT } from '../common/Simulation';

import { RoomService } from './RoomService';
import { ConnectionController } from './ConnectionController';

export class SimulationService {
	private timer: NodeJS.Timer;
	private time: Date = new Date();
	
	constructor(private roomService: RoomService, private connectionController: ConnectionController) {
		// start timer
		this.timer = setInterval(() => this.step(), 20);
	 } 
	
	private step(): void {
		// calculate time since last update
		let now: Date = new Date();
		let deltaTime: number = (now.getTime() - this.time.getTime());
		this.time = now;
		
		// update every started room then send the new positions
		let rooms: Array<Room> = this.roomService.getRooms();
		for(let i: number = 0 ; i < rooms.length; i++) {
			let room: Room = rooms[i];
			if(room.started) {
				this.simulateRoom(room, deltaTime);
				this.sendPosition(room);
			}
		}
	}
	
	private simulateRoom(room: Room, deltaTime: number): void {
		let players :Array<Player> = room.players;
		for(let i: number = 0 ; i < players.length; i++) {
			let player: Player = players[i];
			
			// calculate speed
			if(player.ship.thruster.up) {
				player.ship.speed.x += player.ship.acceleration * Math.cos(player.ship.position.angle);
				player.ship.speed.y += player.ship.acceleration * Math.sin(player.ship.position.angle);
			}
			if(player.ship.thruster.down) {
				player.ship.speed.x -= player.ship.acceleration * Math.cos(player.ship.position.angle);
				player.ship.speed.y -= player.ship.acceleration * Math.sin(player.ship.position.angle);
			}
			
			// calcluate turn speed
			if(player.ship.thruster.left) {
				player.ship.speed.turn += player.ship.turnacc;
				while(player.ship.speed.turn >= 2 * Math.PI) {
					player.ship.speed.turn -= 2 * Math.PI;
				}
			}
			if(player.ship.thruster.right) {
				player.ship.speed.turn -= player.ship.turnacc;
				while(player.ship.speed.turn <= 2 * Math.PI) {
					player.ship.speed.turn += 2 * Math.PI;
				}
			}
			
			// calculate position
			player.ship.position.x += player.ship.speed.x * deltaTime;
			player.ship.position.y += player.ship.speed.y * deltaTime;
			
			// calculate angle
			player.ship.position.angle += player.ship.speed.turn * deltaTime;
			while(player.ship.position.angle >= 2 * Math.PI) {
				player.ship.position.angle -= 2 * Math.PI;
			}
			while(player.ship.position.angle <= 2 * Math.PI) {
				player.ship.position.angle += 2 * Math.PI;
			}
		}
		
		let projectiles: Array<Projectile> = room.projectiles;
		for(let i: number = 0 ; i < players.length; i++) {
			let projectile: Projectile = projectiles[i];
			
			// calculate position
			projectile.position.x += projectile.speed.x * deltaTime;
			projectile.position.y += projectile.speed.y * deltaTime;
		}
		
	}
	
	private sendPosition(room: Room): void {
		let response: SimulationResponse = new SimulationResponse();
		response.room = new Room();
		// REVIEW maybe add logic for less data
		response.room.players = room.players;
		response.room.projectiles = room.projectiles;
		
		this.connectionController.sendToRoom(room, POSITION_EVENT, response);
	}
}
