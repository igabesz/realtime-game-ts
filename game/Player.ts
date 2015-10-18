import { Room } from './Room';
import { Position } from './Position';
import { Speed } from './Speed';
import { Buttons } from './Buttons';
import { IShip } from './IShip';

export class Player {
	private static idcounter = 0;
	public id:number = Player.idcounter++;
	public room:Room;
	public position:Position = new Position();
	public speed:Speed = new Speed();
	public button:Buttons = new Buttons();
	public ship:IShip;
}
