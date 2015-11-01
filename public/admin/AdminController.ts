
interface IAdminScope extends ng.IScope {
	Users: Array<UserData>;
	Rooms: Array<RoomData>;
	Database: boolean;
	refresh: string;
	refreshtext: string;
}

export class UserData {
	public playerName: string;
	public room: string;
}

export class RoomData {
	public name: string;
	public host: string;
	public numOfPlayers: number;
}

export class AdminController {
	
	static $inject = ['$scope', '$http', '$timeout'];
	
	//private timer: ng.IPromise<void> = null;
	private refreshTime: number = 0;
	
	constructor(private $scope: IAdminScope, private $http: ng.IHttpService, private $timeout: ng.ITimeoutService) {
		$scope.Users = [];
		$scope.Rooms = [];
		$scope.Database = false;
		$scope.refresh = '0';
		$scope.refreshtext = 'Off';
		this.refresh();
		this.$timeout(() => this.refresh(), 200, true);
	}
	
	private refresh(): void {
		this.getDatabaseUp();
		this.getUserData();
		this.getRoomData();
		if(this.refreshTime !== 0) {
			this.$timeout(() => this.refresh(), this.refreshTime);
		}
	}
	
	private change(): void {
		let newtime: number = Number(this.$scope.refresh);
		if(newtime !== Number.NaN) { 
			if(newtime <= 0) {
				this.$scope.refreshtext = 'Off';
				/*if(this.timer !== null) {
					this.$timeout.cancel(this.timer);
				}
				this.timer = null;*/
			}
			else {
				this.$scope.refreshtext = newtime + ' sec';
				/*if(this.timer !== null) {
					this.$timeout.cancel(this.timer);
				}
				this.timer = this.$timeout(() => this.refresh(), newtime * 1000);*/
				this.refreshTime = newtime * 1000;
				this.$timeout(() => this.refresh(), this.refreshTime);
			}
		}
	}
	
	private getDatabaseUp(): void {
		let promise: ng.IHttpPromise<boolean> = this.$http.get('/admin/db');
		promise.success((isUp: boolean) => this.resolveDBUp(isUp));
	}
	
	private getUserData(): void {
		let promise: ng.IHttpPromise<Array<UserData>> = this.$http.get('/admin/users');
		promise.success((users: Array<UserData>) => this.resolveUserData(users));
	}
	
	private getRoomData(): void {
		let promise: ng.IHttpPromise<Array<RoomData>> = this.$http.get('/admin/rooms');
		promise.success((rooms: Array<RoomData>) => this.resolveRoomData(rooms));
	}
	
	private resolveUserData(users: Array<UserData>): void {
		let newUsers: Array<UserData> = [];
		for(let i: number = 0; i < users.length; i++) {
			let user: UserData = new UserData();
			if(users[i].playerName === '') {
				user.playerName = 'Not identified yet';
			}
			else {
				user.playerName = users[i].playerName;
			}
			user.room = users[i].room;
			newUsers.push(user);
		}
		this.$scope.Users = newUsers;
	}
	
	private resolveRoomData(rooms: Array<RoomData>): void {
		this.$scope.Rooms = rooms;
	}
	
	private resolveDBUp(isUp: boolean): void {
		this.$scope.Database = isUp;
	}
	
	public stopServer(): void {
		this.$http.post('/admin/stop', null);
	}
}
