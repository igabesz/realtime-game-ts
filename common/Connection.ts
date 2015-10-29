import { Request, Response } from './Message';

/** ConnectionController */

export const PERSONAL_INFO_EVENT: string = 'personalinfo';

export class PersonalInfoRequest extends Request {
	public token: string;
}

export class PersonalInfoResponse extends Response {
	public name: string;
}
