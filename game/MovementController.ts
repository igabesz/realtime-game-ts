import { Player } from '../common/Player';
import { MovementRequest, Direction, MOVEMENT_EVENT, FIRE_EVENT } from '../common/Movement';
import { Projectile, Ship, Speed, Position } from '../common/GameObject';

import { Client, ConnectionController } from './ConnectionController';

export class MovementController {
	
	public addListeners(client: Client): void {
		client.socket.on(MOVEMENT_EVENT, (request:MovementRequest) => this.move(client, request));
		client.socket.on(FIRE_EVENT, () => this.fire(client));
	}
	
	public removeListeners(client: Client): void {
		client.removeListener(MOVEMENT_EVENT);
		client.removeListener(FIRE_EVENT);
	}
	
	private move(client: Client, request: MovementRequest): void {		
		switch(request.direction) {
			case Direction.left:
				client.player.ship.thruster.left = request.action;
				break;
			case Direction.right:
				client.player.ship.thruster.right = request.action;
				break;
			case Direction.up:
				client.player.ship.thruster.up = request.action;
				break;
			case Direction.down:
				client.player.ship.thruster.down = request.action;
				break;
		}
	}
	
	private fire(client: Client): void {
		let projectile: Projectile = this.createProjectile(client.player.ship);
		projectile.owner = client.player;
		projectile.speed = new Speed(); 
		projectile.speed.x = client.player.ship.speed.x * 1.3;
		projectile.speed.y = client.player.ship.speed.y * 1.3;
		projectile.speed.turn = 0;
		projectile.position = new Position();
		projectile.position.x = client.player.ship.position.x;
		projectile.position.y = client.player.ship.position.y;
		projectile.position.angle = client.player.ship.position.angle;
		
		client.player.room.projectiles.push(projectile);
	}
	
	private createProjectile(ship: Ship): Projectile {
		let projectile: Projectile = new Projectile();
		
		projectile.acceleration = ship.projectile.acceleration;
		projectile.damage = ship.projectile.damage;
		projectile.height = ship.projectile.height;
		projectile.width = ship.projectile.width;
		
		return projectile;
	}
}
