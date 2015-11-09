import * as SocketIO from 'socket.io-client';
import { PERSONAL_INFO_EVENT, PersonalInfoRequest } from '../common/Connection';
import { LIST_ROOM_EVENT, JOIN_ROOM_EVENT, ListRoomItem,JoinRoomRequest } from '../common/Room';

/**Wrapper class for SocketIO. 
 * Create new functions if further commands are required.
 * This class should handle the connection errors. 
 */
export class SocketService {
	/**The SocketIO object */
	private socket: SocketIOClient.Socket;
	
	/**Returns the status of the actual SocketIO connection.
	 * Can be 'closed', 'connecting' and 'connected'
	 */
	get status(): string {
		return this.socket ? this.socket.io.readyState : 'closed';
	}
	
	/**Helper function for checking if the connection is active */
	get isConnected(): boolean {
		return this.status === 'connected';
	}
	
	/**Starts SocketIO connection */
	connect() {
		this.socket = SocketIO.connect();		
	}

	getPersonalInfo(token: string) {
		if (!this.socket) { return console.error('Cannot send message -- not initialized'); }
        var pir = new PersonalInfoRequest();
        pir.token = token;
        console.log(pir);
		this.socket.emit(PERSONAL_INFO_EVENT, pir);
	}

    listRooms() {
        if (!this.socket) { return console.error('Cannot send message -- not initialized'); }
        this.socket.emit(LIST_ROOM_EVENT);
    }

    joinRoom(id: string) {
        if (!this.socket) { return console.error('Cannot send message -- not initialized'); }
        var jrr = new JoinRoomRequest();
        jrr.roomName = id;
        this.socket.emit(JOIN_ROOM_EVENT, jrr);
    }
	
	/**This is a tricky thing with the following tasks: 
	 * - registering a SocketIO listener
	 * - auto-calling $timeout for you. Without this Angular would not notice that 
	 * a callback occured and would not refresh the UI. 
	 */
	addHandler(name: string, $timeout: ng.ITimeoutService, handler: (msg: any) => any) {
		if (!this.socket) { return console.error('Cannot attach event handler -- not initialized'); }
		this.socket.on(name, (msg: any) => {
			$timeout(() => handler(msg), 0);
		});
	}
	
	/**This is a raw callback register function. Angular won't notice immediately 
	 * the callback and the changes occured by it. 
	 */
	addHandlerRaw(name: string, handler: (msg: any) => any) {
		if (!this.socket) { return console.error('Cannot attach event handler -- not initialized'); }
		this.socket.on(name, handler);
	}
}
