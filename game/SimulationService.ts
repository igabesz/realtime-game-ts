import { Room } from './Room';
import { RoomService } from './RoomService';

export class SimulationService {
	private timer:NodeJS.Timer = setInterval(() => this.step(), 20);
	private time:Date = new Date();
	
	constructor(public roomSrv:RoomService) { } 
	
	private step() : void {
		let now:Date = new Date();
		let deltaTime:number = (now.getMilliseconds() - this.time.getMilliseconds());
		this.time = now;
		
		let rooms:Array<Room> = this.roomSrv.getRooms();
		for(let i:number = 0 ; i < rooms.length; i++) {
			this.simulateRoom(rooms[i]);
		}
	}
	
	private simulateRoom(room:Room) {
		// TO-DO simulate
	}
}
