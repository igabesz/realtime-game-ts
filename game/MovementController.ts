import { Player } from './Player';
import { Client, ConnectionController } from './ConnectionController';

class MoveRequest {
	public direction:string;
	public action:string;
}

export class MovementController {
	public addHandlers(client:Client) {
		client.socket.on('move', (request:MoveRequest) => this.move(client, request));
	}
	
	private move(client:Client, request:MoveRequest) : void {
		let pressed:boolean;
		if(request.action === 'pressed') {
			pressed = true;
		}
		else if(request.action === 'released') {
			pressed = false;
		}
		else {
			throw 'Failed to recognize action';
		}
		
		// REVIEW not sure if it is a nice solution
		client.player.button[request.direction] = pressed;
	}
}
