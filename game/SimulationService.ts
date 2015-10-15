import { Room } from './Room';
import { Player } from './Player';
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
			this.simulateRoom(rooms[i], deltaTime);
		}
	}
	
	private simulateRoom(room:Room, deltaTime:number) {
		let players:Player[] = room.players;
		for(let i:number = 0 ; i < players.length; i++) {
			let player:Player = players[i];
			player.position.x += player.speed.x * deltaTime;
			player.position.y += player.speed.y * deltaTime;
			player.position.angle += player.speed.angle * deltaTime;
		}
	}
}
