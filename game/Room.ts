import { Player } from './Player';

export class Room {
	public players:Array<Player> = [];
	public started:boolean = false;
	public size:{width:number, height:number};
	
	constructor(public id: string, public host:Player) {
		this.players.push(host);
	}
}
