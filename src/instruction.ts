import { Direction } from './direction';

export default class Instruction {

    private _precondition: string;
    private _postcondition: string;
    private _direction: Direction;
    private _successor: number;

    constructor(pre: string, post: string, dir: Direction, succ: number) {
        this._precondition = pre;
        this._postcondition = post;
        this._direction = dir;
        this._successor = succ;
    }

    public get precondition(): string {
        return this._precondition;
    }

    public get postcondition(): string {
        return this._postcondition;
    }

    public get direction(): Direction {
        return this._direction;
    }

    public get successor(): number {
        return this._successor;
    }

}
