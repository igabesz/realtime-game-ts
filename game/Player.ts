import { Room } from './Room';
import { IShip, GeneralShip } from './Ship';

/** Player model */
export class Player {
	private static idcounter = 0;
	public id:number = Player.idcounter++;
	public room:Room;
	public position:Position = new Position();
	public speed:Speed = new Speed();
	public button:Buttons = new Buttons();
	public ship:IShip = new GeneralShip();
}

export class Position {
	public x: number = 0;
	public y: number = 0;
	public angle: number = 0;
}

export class Speed {
	public x: number = 0;
	public y: number = 0;
	public turn: number = 0;
}

export class Buttons {
	public left: boolean = false;
	public right: boolean = false;
	public up: boolean = false;
	public down: boolean = false;
}
