
/** General */

/** simple message */
export class Message {
	
}

/** request from client to server, response expected */
export class Request extends Message {
	
}

/** response from server to client, after a request */
export class Response extends Message {
	public errors:Array<string> = [];
	public get success() : boolean {
		return this.errors.length === 0;
	}
}

/** ConnectionController */

export const PERSONAL_INFO_EVENT:string = 'personalinfo';

export class PersonalInfoRequest extends Request {
	public token:string;
}

export class PersonalInfoResponse extends Response {
	public name:string;
}

/** SimulationService */

export const POSITION_EVENT:string = 'position';

export class PositionResponse extends Message {
	public data:Array<PlayerPosition>;
}

export class PlayerPosition {
	public name:string;
	public position:Position;
}

/** Player */

export class Position {
	public x: number = 0;
	public y: number = 0;
	public angle: number = 0;
}

/** RoomService */

export const JOIN_ROOM_EVENT:string = 'joinroom';
export const LEAVE_ROOM_EVENT:string = 'leaveroom';
export const START_ROOM_EVENT:string = 'startroom';

export class JoinRoomRequest extends Request {
	public roomName:string;
}

/** MovementController */

export const MOVEMENT_EVENT:string = 'move';

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

export class MovementRequest extends Message {
	public direction:Direction;
	public action:KeyAction;
}
