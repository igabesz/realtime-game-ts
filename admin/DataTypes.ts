import { Player } from '../common/Player';

export class UserData {
	public playerName: string;
	public state: string;
	public room: string;
	public isHost: boolean;
}

export class RoomData {
	public name: string;
	public host: string;
	public players: Array<string> = [];
	public state: string;
}