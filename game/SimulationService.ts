import { Room } from '../common/Room';
import { Player } from '../common/Player';
import { KeyAction } from '../common/Movement';
import { Projectile, GameObject, Ship, Speed, Position } from '../common/GameObject';
import { SimulationResponse, POSITION_EVENT } from '../common/Simulation';

import { RoomService } from './RoomService';
import { ConnectionController } from './ConnectionController';

export class SimulationService {
	private timer: NodeJS.Timer;
	private time: Date = new Date();
	private intervalms: number = 30;
	private deltaTime: number = 0;
	
	private lastProjectileID: number = 0;
	
	constructor(private roomService: RoomService, private connectionController: ConnectionController) {
		// start timer
		this.timer = setInterval(() => this.step(), this.intervalms);
	}
	
	private step(): void {
		// calculate time since last update
		let now: Date = new Date();
		this.deltaTime += now.getTime() - this.time.getTime();
		this.time = now;
		
		// step count
		let stepcount: number = Math.floor(this.deltaTime / this.intervalms);
		this.deltaTime -= stepcount * this.intervalms;
		
		// update every started room then send the new positions
		let rooms: Array<Room> = this.roomService.getRooms();
		for(let i: number = 0 ; i < rooms.length; i++) {
			let room: Room = rooms[i];
			if(room.started) {
				for(let j: number = 0; j < stepcount; j++) {
					this.simulateRoom(room, this.intervalms);
				}
				this.sendPosition(room);
			}
		}
	}
	
	private simulateRoom(room: Room, deltaTime: number): void {
		this.move(room, deltaTime);
		this.fire(room, deltaTime);
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
			
			let speed: number = Math.pow(ship.speed.x, 2) + Math.pow(ship.speed.y, 2);
			let maxSpeed: number = ship.maxSpeed;
			if(speed > maxSpeed || speed < -maxSpeed) {
				ship.speed.x = ship.speed.x / speed * maxSpeed;
				ship.speed.y = ship.speed.y / speed * maxSpeed;
			}
			
			// calcluate turn speed
			let maxTurnSpeed: number = ship.maxTurn;
			if(ship.thruster.right == KeyAction.pressed) {
				ship.speed.turn += ship.turnacc;
				if(ship.speed.turn > maxTurnSpeed) {
					ship.speed.turn = maxTurnSpeed;
				}
			}
			if(ship.thruster.left == KeyAction.pressed) {
				ship.speed.turn -= ship.turnacc;
				if(ship.speed.turn < -maxTurnSpeed) {
					ship.speed.turn = -maxTurnSpeed;
				}
			}
			
			// calculate position
			ship.position.x += ship.speed.x * deltaTime;
			ship.position.y += ship.speed.y * deltaTime;
			
			if(ship.position.x > room.bounds.width / 2) {
				ship.position.x = room.bounds.width / 2;
			}
			else if(ship.position.x < -room.bounds.width / 2) {
				ship.position.x = -room.bounds.width / 2;
			}
			
			if(ship.position.y > room.bounds.height / 2) {
				ship.position.y = room.bounds.height / 2;
			}
			else if(ship.position.y < -room.bounds.height / 2) {
				ship.position.y = -room.bounds.height / 2;
			}
			
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
	
	private fire(room: Room, deltaTime: number): void {
		for(let i: number = 0; i < room.players.length; i++) {
			let player: Player = room.players[i];
			player.ship.currentAttackDelay -= deltaTime;
			if(player.ship.currentAttackDelay <= 0 && player.ship.fire == KeyAction.pressed) {
				player.ship.currentAttackDelay = player.ship.attackDelay;
				
				let projectile: Projectile = this.createProjectile(player.ship);
				projectile.owner = player;
				projectile.speed = new Speed();
				projectile.speed.x = Math.cos(player.ship.position.angle) * 0.5;
				projectile.speed.y = Math.sin(player.ship.position.angle) * 0.5;
				projectile.speed.turn = 0;
				projectile.position = new Position();
				projectile.position.x = player.ship.position.x;
				projectile.position.y = player.ship.position.y;
				projectile.position.angle = player.ship.position.angle;
				
				room.projectiles.push(projectile);
			}
		}
	}
	
	private createProjectile(ship: Ship): Projectile {
		let projectile: Projectile = new Projectile();
		
		projectile.acceleration = ship.projectile.acceleration;
		projectile.damage = ship.projectile.damage;
		projectile.length = ship.projectile.length;
		projectile.width = ship.projectile.width;
		
		projectile.ID = this.lastProjectileID++;
		
		return projectile;
	}
	
	private collisionDetection(room: Room): void {		
		let players: Array<{player: Player, rectangle: Rectangle}> = [];
		let projectiles: Array<{projectile: Projectile, rectangle: Rectangle}> = [];
		
		// Create players hitboxes
		for(let i: number = 0; i < room.players.length; i++) {
			let item: {player: Player, rectangle: Rectangle} =  { 
				player:  room.players[i],
				rectangle: Rectangle.createRectangle(room.players[i].ship) 
			};
			players.push(item);
		}
		
		// Create projectiles hitboxes
		for(let i: number = 0; i < room.projectiles.length; i++) {
			let item: {projectile: Projectile, rectangle: Rectangle} = {projectile: undefined, rectangle: undefined};
			item.projectile = room.projectiles[i];
			item.rectangle = Rectangle.createRectangle(item.projectile);
			projectiles.push(item);
		}
		
		for (let i: number = 0; i < players.length; i++) {
			// Collision Player-Player
			for (let j: number = i + 1; j < players.length; j++) {
				if(this.intersect(players[i].rectangle, players[j].rectangle)) {
					players[i].player.ship.health = 0;
					players[j].player.ship.health = 0;
					this.killPlayer(room, players[j].player, players);
					j--;
					break;
				}
			}
			
			if(	
				players[i].player.ship.position.x > room.size.width / 2 ||
				players[i].player.ship.position.x < -room.size.width / 2 ||
				players[i].player.ship.position.y > room.size.height / 2 ||
				players[i].player.ship.position.y < -room.size.height / 2
				) {
				players[i].player.ship.health -= room.healthDecay;
			}
			
			if(players[i].player.ship.health <= 0) {
				this.killPlayer(room, players[i].player, players);
				i--;
				continue;
			}
			
			// Collision Player-Projectile
			for (let j: number = 0; j < projectiles.length; j++) {
				
				if(	
					projectiles[j].projectile.position.x > room.bounds.width / 2 ||
					projectiles[j].projectile.position.x < -room.bounds.width / 2 ||
					projectiles[j].projectile.position.y > room.bounds.height / 2 ||
					projectiles[j].projectile.position.y < -room.bounds.height / 2
					) {
					this.roomService.removeProjectile(room, projectiles[j].projectile);
					projectiles.splice(j, 1);
					j--;
				}
			
				
				// Disable self damage
				if(projectiles[j].projectile.owner === players[i].player) {
					continue;
				}
				
				if(this.intersect(players[i].rectangle, projectiles[j].rectangle)) {
					room.players[i].ship.health -= projectiles[j].projectile.damage;
					
					this.roomService.removeProjectile(room, projectiles[j].projectile);
					projectiles.splice(j, 1);
					j--;
					
					if(room.players[i].ship.health <= 0) {
						room.players[i].ship.health = 0;
						this.killPlayer(room, players[i].player, players);
						i--;
						break;
					}
				}
			}
		}
		
		// Collision Projectile-Projectile
		for (let i: number = 0; i < projectiles.length; i++) {
			for (let j: number = i + 1; j < projectiles.length; j++) {
				if(this.intersect(projectiles[i].rectangle, projectiles[j].rectangle)) {
					this.roomService.removeProjectile(room, projectiles[i].projectile);
					this.roomService.removeProjectile(room, projectiles[j].projectile);
					projectiles.splice(j, 1);
					projectiles.splice(i, 1);
					i--;
					break;
				}
			}
		}
	}
	
	private killPlayer(room: Room, player: Player, list: Array<{player: Player, rectangle: Rectangle}>): void {
		if(room.players.length > 1) {
			this.roomService.removePlayer(room, player, 'You have died');
		}
		for(let i: number = 0; i < list.length; i++) {
			if(list[i].player === player) {
				list.splice(i, 1);
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
		for(let i: number = 0; i < room.players.length; i++) {
			let player: Player = new Player();
			player.name = room.players[i].name;
			player.ship = room.players[i].ship;
			response.players.push(player);
		}
		for(let i: number = 0; i < room.projectiles.length; i++) {
			let projectile: Projectile = new Projectile();
			projectile.owner = new Player();
			projectile.owner.name = room.projectiles[i].owner.name;
			projectile.acceleration = room.projectiles[i].acceleration;
			projectile.damage = room.projectiles[i].damage;
			projectile.length = room.projectiles[i].length;
			projectile.position = room.projectiles[i].position;
			projectile.speed = room.projectiles[i].speed;
			projectile.width = room.projectiles[i].width;
			response.projectiles.push(projectile);
		}
		
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
		const sizemodifier = 0.8;
		
		let rectangle: Rectangle = new Rectangle();
		let p: Point;
		
		p = new Point();
		p.x = object.position.x + object.length * sizemodifier / 2 * Math.cos(object.position.angle) + object.width * sizemodifier / 2 * Math.sin(object.position.angle);
		p.y = object.position.y + object.length * sizemodifier / 2 * Math.sin(object.position.angle) + object.width * sizemodifier / 2 * Math.cos(object.position.angle);
		rectangle.vertices.push(p);
		
		p = new Point();
		p.x = object.position.x + object.length * sizemodifier / 2 * Math.cos(object.position.angle) - object.width * sizemodifier / 2 * Math.sin(object.position.angle);
		p.y = object.position.y + object.length * sizemodifier / 2 * Math.sin(object.position.angle) - object.width * sizemodifier / 2 * Math.cos(object.position.angle);
		rectangle.vertices.push(p);
		
		p = new Point();
		p.x = object.position.x - object.length * sizemodifier / 2 * Math.cos(object.position.angle) + object.width * sizemodifier / 2 * Math.sin(object.position.angle);
		p.y = object.position.y - object.length * sizemodifier / 2 * Math.sin(object.position.angle) + object.width * sizemodifier / 2 * Math.cos(object.position.angle);
		rectangle.vertices.push(p);
		
		p = new Point();
		p.x = object.position.x - object.length * sizemodifier / 2 * Math.cos(object.position.angle) - object.width * sizemodifier / 2 * Math.sin(object.position.angle);
		p.y = object.position.y - object.length * sizemodifier / 2 * Math.sin(object.position.angle) - object.width * sizemodifier / 2 * Math.cos(object.position.angle);
		rectangle.vertices.push(p);
		
		return rectangle;
	}
}
