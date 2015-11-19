import { UserData, RoomData } from '../../admin/DataTypes';

interface IAdminScope extends ng.IScope {
	Users: Array<UserData>;
	Rooms: Array<RoomData>;
	room: RoomData; 
	player: UserData;
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
		$scope.room = {host: '', name: '', players: [], state: ''};
		$scope.player =  {playerName: '', room: '', state: '', isHost: false};
		$scope.Database = false;
		$scope.refresh = '0';
		$scope.refreshtext = 'Off';
		$scope.allChatText = '';
		$scope.question = null;
		$scope.applyFunction = null;
		$scope.message = null;
		this.selectMenu($location.url().substring(1));
	}
	
	/* Frontend functionality */
	
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
		if(
			menu === 'players' ||
			menu.indexOf('player/') === 0 ||
			menu === 'rooms' ||
			menu.indexOf('room/') === 0
			) {
			value = menu;
		}
		this.$location.url('/' + value);
		this.$scope.selectedMenu = value;
		this.refresh();
	}
	
	/* Frontend logic */
	
	private logout(): void {
		this.$http.get('/admin/logout', {
			headers: {
				'Authorization': sessionStorage.getItem('token'),
				'Cache-Control': 'no-cache'
			}
		}).success((data)=>{
			sessionStorage.clear();
			location.href  = '/login.html';
		});
	}
	
	private refreshAll(): void {
		this.getDatabaseUp();
		this.getUsersData();
		this.getRoomsData();
	}
	
	private refresh(): void {
		switch(this.$scope.selectedMenu) {
			case 'home':
				this.getDatabaseUp();
				return;
			case 'players':
				this.getUsersData();
				return;
			case 'rooms':
				this.getRoomsData();
				return;
		}
		if(this.$scope.selectedMenu.indexOf('room/') === 0) {
			this.getRoomData(this.$scope.selectedMenu.substring(5));
		}
		else if(this.$scope.selectedMenu.indexOf('player/') === 0) {
			this.getUserData(this.$scope.selectedMenu.substring(7));
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
	
	/* Requests to server */
	/* GET */
	
	private get(url: string, success: (any) => void): void {
		this.$http.get(url, {
			headers: {
				'Authorization': sessionStorage.getItem('token'),
				'Cache-Control': 'no-cache'
			}
		}).success((data)=>{
			success(data);
		}).error(() => {
			this.logout();
		});
	}
	
	private getDatabaseUp(): void {
		this.get('/admin/db', (isUp: boolean) => {
			this.$scope.Database = isUp;
		});
	}
	
	private getUsersData(): void {
		this.get('/admin/users', (users: Array<UserData>) => {
			let newUsers: Array<UserData> = [];
			for(let i: number = 0; i < users.length; i++) {
				let user: UserData = users[i];
				if(user.playerName === '') {
					user.playerName = 'Not identified yet';
				}
				newUsers.push(user);
			}
			this.$scope.Users = newUsers;
		});
	}
	
	private getUserData(playername: string): void {
		this.get('/admin/user/' + playername, (data: UserData) => {
			this.$scope.player = data;
		});
	}
	
	private getRoomsData(): void {
		this.get('/admin/rooms', (rooms: Array<RoomData>) => {
			this.$scope.Rooms = rooms;
		});
	}
	
	private getRoomData(roomid: string): void {
		this.get('/admin/room/' + roomid, (data: RoomData) => {
			this.$scope.room = data;
		});
	}
	
	/* POST */
	
	private post(url: string, data: any, success: (any) => void): ng.IHttpPromise<any> {
		return this.$http.post('/admin/stop', data, {
			headers: {
				"Authorization": sessionStorage.getItem('token'),
				'Cache-Control': 'no-cache'
			}
		}).success((data)=>{
			success(data);
		}).error(() => {
			this.logout();
		});
	}
	
	private allChat(): void {
		let text: string = this.$scope.allChatText;
		this.$scope.allChatText = '';
		this.post('allchat', { text }, () => { });
	}
	
	public stopServer(): void {
		if(this.timer !== null) {
			this.$interval.cancel(this.timer);
		}
		this.post('/admin/stop', null, () => { });
		this.$scope.message = 'Server has stopped. Please close the page.';
	}
}
