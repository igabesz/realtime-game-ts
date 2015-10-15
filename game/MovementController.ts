import { Player } from './Player';

export class MovementController {
	constructor() { }
	
	move(player:Player, data: {direction: string }) {
		if(data.direction == "left") {
			player.position.x--;
		}
		else {
			player.position.x++;
		}
	}
}
