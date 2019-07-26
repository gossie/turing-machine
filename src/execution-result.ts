import { Direction } from './direction'

export default class ExecutionResult {

    private _symbol: string;
    private _direction: Direction;
    private _finished: boolean;

    constructor(symbol: string, dir: Direction, finish: boolean) {
        this._symbol = symbol;
        this._direction = dir;
        this._finished = finish;
    }

    public get symbol() {
        return this._symbol;
    }

    public get direction() {
        return this._direction;
    }

    public get finished() {
        return this._finished;
    }

}
