
interface IAdminScope extends ng.IScope {
	Users: Array<UserData>;
	Rooms: Array<RoomData>;
	Database: boolean;
	refresh: string;
	refreshtext: string;
	selectedMenu: string;
}

export class UserData {
	public playerName: string;
	public state: string;
	public room: string;
}

export class RoomData {
	public name: string;
	public host: string;
	public numOfPlayers: number;
}

export class AdminController {
	
	static $inject = ['$scope', '$http', '$timeout'];
	
	private refreshTime: number = 60000;
	private timer: ng.IPromise<void>;
	
	constructor(private $scope: IAdminScope, private $http: ng.IHttpService, private $timeout: ng.ITimeoutService) {
		$scope.Users = [];
		$scope.Rooms = [];
		$scope.Database = false;
		$scope.refresh = '60';
		$scope.refreshtext = '60 sec';
		$scope.selectedMenu = 'Home';
		this.refreshAll();
		this.timer = this.$timeout(() => this.refresh(), this.refreshTime);
	}
	
	private hover(event: any): void {
		let element: ng.IAugmentedJQuery = angular.element(event.target);
		element.addClass('hover');
	}
	
	private unhover(event: any): void {
		let element: ng.IAugmentedJQuery = angular.element(event.target);
		element.removeClass('hover');
	}
	
	private refreshAll(): void {
		this.getDatabaseUp();
		this.getUserData();
		this.getRoomData();
	}
	
	private refresh(): void {
		switch(this.$scope.selectedMenu) {
			case 'Home':
				this.getDatabaseUp();
				break;
			case 'Players':
				this.getUserData();
				break;
			case 'Rooms':
				this.getRoomData();
				break;
		}
		if(this.refreshTime !== 0) {
			this.timer = this.$timeout(() => this.refresh(), this.refreshTime);
		}
	}
	
	private change(): void {
		let newtime: number = Number(this.$scope.refresh);
		if(newtime !== Number.NaN) { 
			if(this.timer !== null) {
				this.$timeout.cancel(this.timer);
				this.timer = null;
			}
			if(newtime <= 0) {
				this.$scope.refreshtext = 'Off';
			}
			else {
				this.$scope.refreshtext = newtime + ' sec';
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
			let user: UserData = users[i];
			if(user.playerName === '') {
				user.playerName = 'Not identified yet';
			}
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
