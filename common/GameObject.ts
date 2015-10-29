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
	turnacc: number;
	thruster: Thruster = new Thruster();
}

/** Ship types */

export enum ShipType {
	general
}

export class GeneralShip extends Ship {
	public width: number = 10;
	public height: number = 20;
	public acceleration: number = 0.1;
	public turnacc: number = 0.03;
}
