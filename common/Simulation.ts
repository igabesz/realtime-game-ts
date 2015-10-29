import { Message } from './Message';
import { Room } from './Room';


/** SimulationService */

export const POSITION_EVENT: string = 'position';

export class SimulationResponse extends Message {
	public room: Room;
}
