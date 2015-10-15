import { SocketService } from './SocketService';
import * as _ from 'lodash';


/**Extending IScope with the custom properties off the current $scope */
interface ITestScope extends ng.IScope {
	testData:string;
}


export class TestController {
	static $inject = ['$scope', 'SocketService'];
	
	constructor(
		private $scope: ITestScope, 
		private socketService: SocketService
	) {
		
	}
	
	sendTestData() : void {
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
				this.socketService.sendTestData(event, item);
			}
		}
	}
}
