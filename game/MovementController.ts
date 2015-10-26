import { Player } from './Player';
import { Client, ConnectionController } from './ConnectionController';
import { MovementRequest, Direction, MOVEMENT_EVENT } from '../common/Message';


export class MovementController {
	
	public addListeners(client:Client) {
		client.socket.on(MOVEMENT_EVENT, (request:MovementRequest) => this.move(client, request));
	}
	
	public removeListeners(client:Client) {
		client.socket.removeAllListeners(MOVEMENT_EVENT);
	}
	
	private move(client:Client, request:MovementRequest) : void {		
		switch(request.direction) {
			case Direction.left:
				client.player.button.left = request.action;
				break;
			case Direction.right:
				client.player.button.right = request.action;
				break;
			case Direction.up:
				client.player.button.up = request.action;
				break;
			case Direction.down:
				client.player.button.down = request.action;
				break;
		}
	}
}
