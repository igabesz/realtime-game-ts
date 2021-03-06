import { KeyAction } from './Movement';
import { Player } from './Player';

/** Superclass of all game objects */
export abstract class GameObject {
	public position: Position;
	public speed: Speed;
	public acceleration: number;
	public width: number;
	public length: number;
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
	public ID: number;
}

/** Ship superclass */

export enum ShipType {
	general,
	fast
}

export abstract class Ship extends GameObject {
	public type: ShipType;
	public health: number;
	public maxSpeed: number;
	public maxTurn: number;
	public turnacc: number;
	public thruster: Thruster = new Thruster();
	public projectile: Projectile = new Projectile();
	public fire: KeyAction = KeyAction.released;
	public attackDelay: number;
	public currentAttackDelay: number;
}

/** Ship types */

export class GeneralShip extends Ship {
	public width: number = 200;
	public length: number = 79;
	public acceleration: number = 0.004;
	public maxSpeed: number = Math.pow(0.2, 2);
	public turnacc: number = 0.00004;
	public maxTurn: number = 0.002;
	public health: number = 100;
	constructor() {
		super();
		this.type = ShipType.general;
		this.projectile.acceleration = 0;
		this.projectile.damage = 10;
		this.projectile.length = 17;
		this.projectile.width = 54;
		this.attackDelay = 150;
	}
}

export class FastShip extends Ship {
	public width: number = 160;
	public length: number = 58;
	public acceleration: number = 0.005;
	public maxSpeed: number = Math.pow(0.25, 2);
	public turnacc: number = 0.00005;
	public maxTurn: number = 0.0025;
	public health: number = 50;
	constructor() {
		super();
		this.type = ShipType.fast;
		this.projectile.acceleration = 0;
		this.projectile.damage = 5;
		this.projectile.length = 13;
		this.projectile.width = 40;
		this.attackDelay = 120;
	}
}
