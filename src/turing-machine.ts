import { Observable, Subject } from 'rxjs';
import ExecutionResult from './execution-result';
import Tape from './tape';
import State from './state';
import StateManager from './state-manager';

export default class TuringMachine {

    private _tape: Tape;
    private _stateManager: StateManager;
    private _stepDelay: number;
    private _tapeSubject: Subject<Tape> = new Subject();
    private _interval: number;

    constructor(tape: Tape, stateManager: StateManager, stepDelay: number = 1000) {
        this._tape = tape;
        this._stateManager = stateManager;
        this._stepDelay = stepDelay;
    }

    public loadProgram(states: State[]): void {
        states.forEach((state: State) => this._stateManager.addState(state));
    }

    public loadWord(word: string): void {
        const wordArray: Array<string> = [];
        for (let i=0; i<word.length; i++) {
            wordArray.push(word.charAt(i));
        }
        this._tape.word = wordArray;
        this._tapeSubject.next(this._tape);
    }

    public observeState(): Observable<Tape> {
        return this._tapeSubject.asObservable();
    }

    public run(): void {
        this._interval = setInterval(() => {
            const currentSymbol: string = this._tape.current;
            const result: ExecutionResult = this._stateManager.execute(currentSymbol);
            this._tape.writeSymbol(result.symbol);
            this._tape.move(result.direction);
            this._tapeSubject.next(this._tape);
            if (result.finished) {
                clearInterval(this._interval);
            }
        }, this._stepDelay);
    }

    public reset(): void {
        this._tape.reset();
        this._stateManager.reset();
        clearInterval(this._interval);
    }

}
