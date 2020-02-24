import { EventType } from './event-type';

export default class Event {

    private _type: EventType;
    private _message: string;
    private _payload: object;

    constructor(type: EventType, message, payload?: object) {
        this._type = type;
        this._message = message;
        this._payload = payload;
    }

    public get type(): EventType {
        return this._type;
    }

    public get message(): string {
        return this._message;
    }

    public get payload(): object {
        return this._payload;
    }

}
