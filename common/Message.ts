
/** ConnectionController */

export const PERSONAL_INFO_EVENT:string = 'personalinfo';

export class PersonalInfoRequest {
	public token:string;
}

export class PersonalInfoResponse {
	public name:string;
}

/** SimulationService */

export const POSITION_EVENT:string = 'position';

export class PositionResponse {
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

export class JoinRoomRequest {
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

export class MovementRequest {
	public direction:Direction;
	public action:KeyAction;
}
