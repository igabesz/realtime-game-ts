import { Room } from './Room';
import { IShip, GeneralShip } from './Ship';
import { Position, KeyAction } from '../common/Message';

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

export class Speed {
	public x: number = 0;
	public y: number = 0;
	public turn: number = 0;
}

export class Buttons {
	public left: KeyAction = KeyAction.released;
	public right: KeyAction = KeyAction.released;
	public up: KeyAction = KeyAction.released;
	public down: KeyAction = KeyAction.released;
}
