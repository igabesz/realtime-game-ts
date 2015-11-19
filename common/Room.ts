import { Request, Response, Message } from './Message';
import { Player } from './Player';
import { Projectile, ShipType, Ship } from './GameObject';

/** Stores room data */
export class Room {
	public id: string;
	public host: Player;
	public players: Array<Player> = [];
	public projectiles: Array<Projectile> = [];
	public started: boolean;
	public size: {width:number, height:number};
	
	public ready(): boolean {
		if(this.players.length < 2) {
			return false;
		}
		for(let i: number = 0; i < this.players.length; i++) {
			let player: Player = this.players[i];
			if(!player.ready()) {
				return false;
			}
		}
		return true;
	}
}

/** RoomService */

export const LIST_ROOM_EVENT: string = 'listroom';
export const LIST_SHIP_EVENT: string = 'listship';
export const JOIN_ROOM_EVENT: string = 'joinroom';
export const ROOM_STATE_EVENT: string = 'roomstate';
export const LEAVE_ROOM_EVENT: string = 'leaveroom';
export const READY_ROOM_EVENT: string = 'readyroom';
export const START_ROOM_EVENT: string = 'startroom';

export class JoinRoomRequest extends Request {
	public roomName: string;
}

export class ReadyRoomRequest extends Request {
	public shipType: ShipType;
}

export class RoomStateMessage extends Message {
	public players: Array<Player> = [];
	public hostname: string;
	public started: boolean;
}

export class ListRoomItem {
	public id: string;
	public playerCount: number;
}

export class ListRoomResponse extends Response {
	public rooms: Array<ListRoomItem> = [];
}

export class ListShipsResponse extends Response {
	public ships: Array<Ship> = [];
}