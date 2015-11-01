import { Message } from './Message';
import { Player } from './Player';
import { Projectile } from './GameObject';

/** SimulationService */

export const POSITION_EVENT: string = 'position';

export class SimulationResponse extends Message {
	public players: Array<Player> = [];
	public projectiles: Array<Projectile> = [];
}