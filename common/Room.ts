import { Request, Response } from './Message';
import { Player } from './Player';
import { Projectile, ShipType } from './GameObject';

/** Stores room data */
export class Room {
	public id: string;
	public host: Player;
	public players: Array<Player> = [];
	public projectiles: Array<Projectile> = [];
	public started: boolean;
	public size: {width:number, height:number};
}

/** RoomService */

export const LIST_ROOM_EVENT: string = 'listroom';
export const JOIN_ROOM_EVENT: string = 'joinroom';
export const LEAVE_ROOM_EVENT: string = 'leaveroom';
export const READY_ROOM_EVENT: string = 'readyroom';
export const START_ROOM_EVENT: string = 'startroom';

export class JoinRoomRequest extends Request {
	public roomName: string;
}

export class ReadyRoomRequest extends Request {
	public shipType: ShipType;
}

export class ListRoomItem {
	public id: string;
	public playerCount: number;
}

export class ListRoomResponse extends Response {
	public rooms: Array<ListRoomItem> = [];
}
