import { Room } from '../common/Room';
import { Player } from '../common/Player';
import { KeyAction } from '../common/Movement';
import { Projectile, GameObject, Ship } from '../common/GameObject';
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
		this.move(room, deltaTime);
		this.collisionDetection(room);
	}
	
	private move(room: Room, deltaTime: number): void {
		let players :Array<Player> = room.players;
		for(let i: number = 0 ; i < players.length; i++) {
			let ship: Ship = players[i].ship;
			// calculate speed
			if(ship.thruster.up == KeyAction.pressed) {
				ship.speed.x += ship.acceleration * Math.cos(ship.position.angle);
				ship.speed.y += ship.acceleration * Math.sin(ship.position.angle);
			}
			if(ship.thruster.down == KeyAction.pressed) {
				ship.speed.x -= ship.acceleration * Math.cos(ship.position.angle);
				ship.speed.y -= ship.acceleration * Math.sin(ship.position.angle);
			}
			
			// calcluate turn speed
			if(ship.thruster.left == KeyAction.pressed) {
				ship.speed.turn += ship.turnacc;
				while(ship.speed.turn >= 2 * Math.PI) {
					ship.speed.turn -= 2 * Math.PI;
				}
			}
			if(ship.thruster.right == KeyAction.pressed) {
				ship.speed.turn -= ship.turnacc;
				while(ship.speed.turn <= 2 * Math.PI) {
					ship.speed.turn += 2 * Math.PI;
				}
			}
			
			// calculate position
			ship.position.x += ship.speed.x * deltaTime;
			ship.position.y += ship.speed.y * deltaTime;
			
			// calculate angle
			ship.position.angle += ship.speed.turn * deltaTime;
			while(ship.position.angle >= 2 * Math.PI) {
				ship.position.angle -= 2 * Math.PI;
			}
			while(ship.position.angle <= 2 * Math.PI) {
				ship.position.angle += 2 * Math.PI;
			}
		}
		
		let projectiles: Array<Projectile> = room.projectiles;
		for(let i: number = 0 ; i < projectiles.length; i++) {
			let projectile: Projectile = projectiles[i];
			
			// calculate position
			projectile.position.x += projectile.speed.x * deltaTime;
			projectile.position.y += projectile.speed.y * deltaTime;
		}
	}
	
	private collisionDetection(room: Room): void {
		// TO-DO remove from players to disable check after death
		
		// REVIEW Collision with the map 
		
		// Collision with other obejcts
		for (let i: number = 0; i < room.players.length; i++) {
			let player: Player = room.players[i];
			let a: Rectangle = Rectangle.createRectangle(player.ship);
			// TO-DO optimization
			let b: Rectangle;
			
			for (let j: number = i + 1; j < room.players.length; j++) {
				b = Rectangle.createRectangle(room.players[j].ship);
				if(this.intersect(a, b)) {
					player.ship.health = 0;
					room.players[j].ship.health = 0;
				}
			}
			if(player.ship.health === 0) {
				continue;
			}
			
			for (let j: number = 0; j < room.projectiles.length; j++) {
				if(room.projectiles[j].owner === player) {
					continue;
				}
				b = Rectangle.createRectangle(room.projectiles[j]);
				if(this.intersect(a, b)) {
					room.players[i].ship.health -= room.projectiles[j].damage;
					if(room.players[i].ship.health < 0) {
						room.players[i].ship.health = 0;
					}
					room.projectiles.splice(j, 1);
				}
			}
		}
	}
	
	private intersect(a: Rectangle, b: Rectangle): boolean {
		for (let i: number = 0; i < a.vertices.length; i++)
		{
			let p1: Point = a.vertices[i];
			let p2: Point = a.vertices[(i + 1) % a.vertices.length];

			var normal = new Point();
			normal.x = p2.y - p1.y;
			normal.y = p1.x - p2.x;

			let minA: number = null;
			let maxA: number = null;
			for (let j: number = 0; j < a.vertices.length; j++)
			{
				let p: Point = a.vertices[j];
				let projected: number = normal.x * p.x + normal.y * p.y;
				if (minA == null || projected < minA) {
					minA = projected;
				}
				if (maxA == null || projected > maxA) {
					maxA = projected;
				}
			}

			let minB: number = null;
			let maxB: number = null;
			for (let j: number = 0; j < b.vertices.length; j++)
			{
				let p: Point = b.vertices[j];
				let projected: number = normal.x * p.x + normal.y * p.y;
				if (minB == null || projected < minB) {
					minB = projected;
				}
				if (maxB == null || projected > maxB) {
					maxB = projected;
				}
			}

			if (maxA < minB || maxB < minA) {
				return false;
			}
		}
			
		for (let i: number = 0; i < b.vertices.length; i++)
		{
			let p1: Point = b.vertices[i];
			let p2: Point = b.vertices[(i + 1) % b.vertices.length];

			var normal = new Point();
			normal.x = p2.y - p1.y;
			normal.y = p1.x - p2.x;

			let minA: number = null;
			let maxA: number = null;
			for (let j: number = 0; j < a.vertices.length; j++)
			{
				let p: Point = a.vertices[j];
				let projected: number = normal.x * p.x + normal.y * p.y;
				if (minA == null || projected < minA) {
					minA = projected;
				}
				if (maxA == null || projected > maxA) {
					maxA = projected;
				}
			}

			let minB: number = null;
			let maxB: number = null;
			for (let j: number = 0; j < b.vertices.length; j++)
			{
				let p: Point = b.vertices[j];
				var projected = normal.x * p.x + normal.y * p.y;
				if (minB == null || projected < minB) {
					minB = projected;
				}
				if (maxB == null || projected > maxB) {
					maxB = projected;
				}
			}

			if (maxA < minB || maxB < minA) {
				return false;
			}
		}
		return true;
	}
	
	private sendPosition(room: Room): void {
		let response: SimulationResponse = new SimulationResponse();
		for( let i: number = 0; i < room.players.length; i++) {
			let player: Player = new Player();
			player.name = room.players[i].name;
			// REVIEW further data reduction
			player.ship = room.players[i].ship;
			response.players.push(player);
		}
		response.projectiles = room.projectiles;
		
		this.connectionController.sendToRoom(room, POSITION_EVENT, response);
	}
}

class Point {
	public x: number;
	public y: number;
}

class Rectangle {
	public vertices: Array<Point> = [];
	
	public static createRectangle(object: GameObject): Rectangle {
		let rectangle: Rectangle = new Rectangle();
		let p: Point = new Point();
		
		p.x = object.position.x + (object.height / 2 + object.width / 2) * Math.cos(object.position.angle);
		p.y = object.position.y + (object.height / 2 + object.width / 2) * Math.sin(object.position.angle);
		rectangle.vertices.push(p);
		p.x = object.position.x + (object.height / 2 - object.width / 2) * Math.cos(object.position.angle);
		p.y = object.position.y + (object.height / 2 - object.width / 2) * Math.sin(object.position.angle);
		rectangle.vertices.push(p);
		p.x = object.position.x + (-object.height / 2 + object.width / 2) * Math.cos(object.position.angle);
		p.y = object.position.y + (-object.height / 2 + object.width / 2) * Math.sin(object.position.angle);
		rectangle.vertices.push(p);
		p.x = object.position.x + (-object.height / 2 - object.width / 2) * Math.cos(object.position.angle);
		p.y = object.position.y + (-object.height / 2 - object.width / 2) * Math.sin(object.position.angle);
		rectangle.vertices.push(p);
		
		return rectangle;
	}
}
