import { UserData, RoomData } from '../../admin/DataTypes';

interface IAdminScope extends ng.IScope {
	Users: Array<UserData>;
	Rooms: Array<RoomData>;
	Database: boolean;
	refresh: string;
	refreshtext: string;
	selectedMenu: string;
	allChatText: string;
	question: string;
	applyFunction: Function;
	message: string;
}


export class AdminController {
	
	static $inject = ['$scope', '$http', '$interval', '$location'];
	
	private refreshTime: number = 0;
	private timer: ng.IPromise<void> = null;
	
	constructor(private $scope: IAdminScope, private $http: ng.IHttpService, private $interval: ng.IIntervalService, private $location: ng.ILocationService) {
		$scope.Users = [];
		$scope.Rooms = [];
		$scope.Database = false;
		$scope.refresh = '0';
		$scope.refreshtext = 'Off';
		$scope.allChatText = '';
		$scope.question = null;
		$scope.applyFunction = null;
		$scope.message = null;
		this.selectMenu($location.url().substring(1));
	}
	
	private hover(event: any): void {
		let element: ng.IAugmentedJQuery = angular.element(event.target);
		element.addClass('hover');
	}
	
	private unhover(event: any): void {
		let element: ng.IAugmentedJQuery = angular.element(event.target);
		element.removeClass('hover');
	}
	
	private setQuestion(action: string): void {
		switch(action) {
		case 'stopServer':
			this.$scope.question = 'Are you sure to stop the server?';
			this.$scope.applyFunction = () => this.stopServer();
			break;
		case 'logout':
			this.$scope.question = 'Are you sure to logout?';
			this.$scope.applyFunction = () => this.logout();
			break;
		}
	}
	
	private answerQuestion(answer: boolean): void {
		this.$scope.question = null;
		if(answer) {
			this.$scope.applyFunction();
		}
		this.$scope.applyFunction = null;
	}
	
	private selectMenu(menu: string): void {
		let value: string = 'home';
		let validMenus: Array<string> = ['players', 'rooms'];
		for(let i: number = 0; i < validMenus.length; i++) {
			if(menu === validMenus[i]) {
				value = menu;
			}
		}
		this.$location.url('/' + value);
		this.$scope.selectedMenu = value;
		this.refresh();
	}
	
	private logout(): void {
		location.href  = '/login.html';
	}
	
	private refreshAll(): void {
		this.getDatabaseUp();
		this.getUserData();
		this.getRoomData();
	}
	
	private refresh(): void {
		switch(this.$scope.selectedMenu) {
			case 'home':
				this.getDatabaseUp();
				break;
			case 'players':
				this.getUserData();
				break;
			case 'rooms':
				this.getRoomData();
				break;
		}
	}
	
	private change(): void {
		let newtime: number = Number(this.$scope.refresh);
		if(newtime !== Number.NaN) { 
			if(newtime <= 0) {
				this.$scope.refreshtext = 'Off';
				if(this.timer !== null) {
					this.$interval.cancel(this.timer);
					this.timer = null;
				}
			}
			else {
				this.$scope.refreshtext = newtime + ' sec';
				this.refreshTime = newtime * 1000;
				if(this.timer !== null) {
					this.$interval.cancel(this.timer);
				}
				this.timer = this.$interval(() => this.refresh(), this.refreshTime); 
			}
		}
	}
	
	private allChat(): void {
		let text: string = this.$scope.allChatText;
		this.$scope.allChatText = '';
		this.$http.post('allchat', { text });
	}
	
	public stopServer(): void {
		if(this.timer !== null) {
			this.$interval.cancel(this.timer);
		}
		this.$http.post('/admin/stop', null);
		this.$scope.message = 'Server has stopped. Please close the page.';
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
}
