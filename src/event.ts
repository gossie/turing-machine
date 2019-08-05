import { EventType } from './event-type';

export default class Event {

    private _type: EventType;
    private _payload: object;

    constructor(type: EventType, payload: object) {
        this._type = type;
        this._payload = payload
    }

    public get type(): EventType {
        return this._type;
    }

    public get payload(): object {
        return this._payload;
    }

}
