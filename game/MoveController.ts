import { StateService, IState } from './StateService';

// A few things are still not resolved: The ID of the player is unknown,
// plus now we cannot send direct message to the player. 
// Later, when it will be necessary, create a nice solution for this. 
export class MoveController {
	constructor(private stateSvc: StateService) { }
	
	move(data: {direction: string }) {
		let player = this.stateSvc.state.player;
		switch (data.direction) {
			case 'left':
				player.x--;
				break;
			case 'right':
				player.x++;
				break;
		}
	}
}
