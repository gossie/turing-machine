import { interval, Observable, Subject, Subscription } from 'rxjs';
import ExecutionResult from './execution-result';
import Tape from './tape';
import State from './state';
import StateManager from './state-manager';

export default class TuringMachine {

    private _tape: Tape;
    private _stateManager: StateManager;
    private _stepDelay: number;
    private _tapeSubject: Subject<Tape> = new Subject();
    private _subscription: Subscription;

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
        this._subscription = interval(this._stepDelay)
            .subscribe(
                () => this.performStep(),
                (error: Error) => this.handleError(error)
            );
    }

    private performStep(): void {
        const currentSymbol: string = this._tape.current;
        const result: ExecutionResult = this._stateManager.execute(currentSymbol);
        this._tape.writeSymbol(result.symbol);
        this._tape.move(result.direction);
        this._tapeSubject.next(this._tape);
        if (result.finished) {
            this._subscription.unsubscribe();
        }
    }

    private handleError(error: Error): void {
        this._subscription.unsubscribe();
        console.error('error', error);
    }

    public reset(): void {
        this._tape.reset();
        this._stateManager.reset();
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

}
