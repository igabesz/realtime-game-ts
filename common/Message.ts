/** simple message */
export class Message {
	
}

/** request from client to server, response expected */
export class Request extends Message {
	
}

/** response from server to client, after a request */
export class Response extends Message {
	public errors: Array<string> = [];
	public success(): boolean {
		return this.errors.length === 0;
	}
}

export class AllChatMessage extends Message {
	public message: string;
}


