import { Player } from '../common/Player';
import { MovementRequest, FireRequest, Direction } from '../common/Movement';

import { Client, ConnectionController } from './ConnectionController';

export class MovementController {
	
	public move(client: Client, request: MovementRequest): void {
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
	
	public fire(client: Client, request: FireRequest): void {
		client.player.ship.fire = request.action;
	}
}
