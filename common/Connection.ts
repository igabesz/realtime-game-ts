import { Request, Response } from './Message';

/** ConnectionController */

export const PING_PONG_EVENT: string = 'pingpong';

export class PingRequest extends Request {
	public time: Date = new Date();
}

export class PongResponse extends Response {
	public time: Date;
}

export const PERSONAL_INFO_EVENT: string = 'personalinfo';

export class PersonalInfoRequest extends Request {
	public token: string;
}

export class PersonalInfoResponse extends Response {
	public name: string;
}
