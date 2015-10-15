import { Room } from './Room';
import { Position } from './Position';
import { Speed } from './Speed';

export class Player {
	public room:Room;
	public position:Position = new Position();
	public speed:Speed = new Speed();
}
