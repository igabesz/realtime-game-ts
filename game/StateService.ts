// TODO: Create a better interface, refactor these classes based on requirements

export interface ICharacter {
	x: number;
	y: number;
}

export interface IState {
	player: ICharacter
}


export class StateService {
	state: IState = {
		player: {
			x: 0,
			y: 0,
		}
	};	
}
