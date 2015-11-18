import { Ship } from './GameObject';
import { Room } from './Room';

/** Stores player data */
export class Player {
	public name: string;
	public room: Room;
	public ship: Ship;
	
	public ready(): boolean {
		return this.ship !== null;
	}
}
