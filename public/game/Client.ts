import { Ship } from './Ship';

export class Client {
	
	player: Ship;
    name: string;
	
	constructor(name: string) {
		this.name = name;
	}
}