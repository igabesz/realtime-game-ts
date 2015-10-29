import { Player } from '../common/Player';
import { MovementRequest, Direction, MOVEMENT_EVENT, FIRE_EVENT } from '../common/Movement';

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
		
	} 
}
