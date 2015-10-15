import { Player } from './Player';

export class Room {
	public players:Array<Player> = [];
	public started:boolean = false;
	
	constructor(public id: string, public host:Player) {
		this.players.push(host);
	}
}
