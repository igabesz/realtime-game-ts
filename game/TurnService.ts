import { StateService } from './StateService';


export class TurnService {
	private interval: number;
	private lastTime: number;
	private timerId: any = null;
	
	constructor(
		private stateSvc: StateService, 
		private msgSender: (name: string, data: any) => any
	) {}
	
	start(interval: number) {
		// Active timer
		if (this.timerId) { return; }
		
		this.interval = interval;
		this.lastTime = Date.now();
		this.timerId = setTimeout(() => this.turnWrapper(), interval);
	}
	
	stop() {
		if (this.timerId === null) { return; }

		clearTimeout(this.timerId);
		this.timerId = null;
	}
	
	turnWrapper() {
		let now = Date.now(); 
		let dt = now - this.lastTime;
		this.lastTime = now; 
		// Main logic here
		this.turn(dt);
		// Scheduling
		let interval = 2 * this.interval - dt;
		interval = (interval < 0) ? 0 : interval;
		this.timerId = setTimeout(() => this.turnWrapper(), interval);
	}
	
	// Main logic here
	private turn(dt) {
		//console.log(dt);
		this.msgSender('state', this.stateSvc.state);
	}
}
