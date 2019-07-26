import { Observable, Subject } from 'rxjs';
import ExecutionResult from './execution-result';
import Tape from './tape';
import State from './state';
import StateManager from './state-manager';

export default class TuringMachine {

    private _tape: Tape;
    private _stateManager: StateManager;
    private _tapeSubject: Subject<Tape> = new Subject();

    constructor(tape: Tape, stateManager: StateManager) {
        this._tape = tape;
        this._stateManager = stateManager;
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
        let run: boolean = true;
        while(run) {
            const currentSymbol: string = this._tape.current;
            const result: ExecutionResult = this._stateManager.execute(currentSymbol);
            this._tape.writeSymbol(result.symbol);
            this._tape.move(result.direction);
            run = !result.finished;
            this._tapeSubject.next(this._tape);
        }
    }

    public reset(): void {
        this._tape.reset();
        this._stateManager.reset();
    }

}
