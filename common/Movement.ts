import { Message } from './Message';

export enum Direction {
	left,
	right,
	up,
	down
}

export enum KeyAction {
	pressed,
	released
}

/** MovementController */

export const MOVEMENT_EVENT: string = 'move';
export const FIRE_EVENT: string = 'fire';

export class MovementRequest extends Message {
	public direction: Direction;
	public action: KeyAction;
}

export class FireRequest extends Message {
	public action: KeyAction;
}
