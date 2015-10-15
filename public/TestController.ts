import * as SocketIO from 'socket.io-client';
import * as _ from 'lodash';


/**Extending IScope with the custom properties off the current $scope */
interface ITestScope extends ng.IScope {
	testData:string;
}


export class TestController {
	static $inject = ['$scope', 'SocketService'];
	private socket: SocketIOClient.Socket;
	
	constructor(
		private $scope: ITestScope
	) {
		this.socket = SocketIO.connect();
		this.socket.on('test', (msg) => console.info(msg));
	}
	
	public sendTestData() : void {
		let text:string = this.$scope.testData;
		this.$scope.testData = "";
		let rows:string[] = text.split('\n');
		for(let i:number = 0; i < rows.length; i++) {
			let row:string = rows[i];
			let index:number = row.indexOf('\t')
			if(index != -1){
				let event:string = row.substring(0, index);
				let dataStr:string = row.substring(index + 1);
				let item = JSON.parse(dataStr);
				this.send(event, item);
			}
		}
	}
	
	private send(event:string, data:any) : void {
		if (!this.socket) { return console.error('Cannot send message -- not initialized'); }
		this.socket.emit(event, data);
		console.info(event, data);
	} 
}
