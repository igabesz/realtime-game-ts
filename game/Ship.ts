export interface IShip {
	width:number;
	height:number;
	acc:number;
	turnacc:number;
}

export class GeneralShip {
	public width:number = 10;
	public height:number = 20;
	public acc:number = 0.1;
	public turnacc:number = 0.03;
}