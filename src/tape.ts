import { Direction } from './direction'

export default class Tape {

    private readonly _directionStrategies: Map<Direction, () => void> = new Map([
        [Direction.LEFT, this.moveLeft.bind(this)],
        [Direction.RIGHT, this.moveRight.bind(this)]
    ]);

    private _index: number = 0;
    private _tape: Array<string> = ['_'];

    public set word(word: Array<string>) {
        this._tape = word;
        this._index = 0;
    }

    public get word(): Array<string> {
        return this._tape;
    }

    public get current() {
        return this._tape[this._index];
    }

    public get currentIndex() {
        return this._index;
    }

    public writeSymbol(letter: string): void {
        this._tape[this._index] = letter;
    }

    public move(direction: Direction): void {
        this._directionStrategies.get(direction)();
    }

    public reset(): void {
        this._index = 0;
        this._tape = [];
    }

    private moveRight(): void {
        this._index++;
        if (this._index >= this._tape.length) {
            this._tape.push('_');
        }
    }

    private moveLeft(): void {
        this._index--;
        if (this._index < 0) {
            this._tape.unshift('_');
            this._index = 0;
        }
    }
}
