import { Room } from './Room';
import { Position } from './Position';
import { Speed } from './Speed';
import { Buttons } from './Buttons';

export class Player {
	public room:Room;
	public position:Position = new Position();
	public speed:Speed = new Speed();
	public button:Buttons = new Buttons();
}
