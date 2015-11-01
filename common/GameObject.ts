import { KeyAction } from './Movement';
import { Player } from './Player';

/** Superclass of all game objects */
export abstract class GameObject {
	public position: Position;
	public speed: Speed;
	public acceleration: number;
	public width: number;
	public height: number;
}

export class Position {
	public x: number;
	public y: number;
	public angle: number;
}

export class Speed {
	public x: number;
	public y: number;
	public turn: number;
}

export class Thruster {
	public left: KeyAction = KeyAction.released;
	public right: KeyAction = KeyAction.released;
	public up: KeyAction = KeyAction.released;
	public down: KeyAction = KeyAction.released;
}

/** Projectile */

export class Projectile extends GameObject {
	public damage: number;
	public owner: Player;
}

/** Ship superclass */

export abstract class Ship extends GameObject {
	public health: number;
	public turnacc: number;
	public thruster: Thruster = new Thruster();
	public projectile: Projectile = new Projectile(); 
}

/** Ship types */

export enum ShipType {
	general,
	fast
}

export class GeneralShip extends Ship {
	public width: number = 10;
	public height: number = 20;
	public acceleration: number = 0.1;
	public turnacc: number = 0.03;
	public health: number = 100;
	constructor() {
		super();
		this.projectile.acceleration = 0;
		this.projectile.damage = 10;
		this.projectile.height = 10;
		this.projectile.width = 10;
	}
}

export class FastShip extends Ship {
	public width: number = 8;
	public height: number = 15;
	public acceleration: number = 0.15;
	public turnacc: number = 0.05;
	public health: number = 50;
	constructor() {
		super();
		this.projectile.acceleration = 0;
		this.projectile.damage = 5;
		this.projectile.height = 8;
		this.projectile.width = 8;
	}
}
