import { interval, Observable, Subject, Subscription } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { EventType } from './event-type';
import Event from './event';
import ExecutionResult from './execution-result';
import Tape from './tape';
import State from './state';
import StateManager from './state-manager';

export default class TuringMachine {

    private _tape: Tape;
    private _stateManager: StateManager;
    private _stepDelay: number;
    private _tapeSubject: Subject<Event> = new Subject();
    private _subscription: Subscription;

    constructor(tape: Tape, stateManager: StateManager, stepDelay: number = 250) {
        this._tape = tape;
        this._stateManager = stateManager;
        this._stepDelay = stepDelay;
    }

    public loadProgram(states: State[]): void {
        if (!states || states.length === 0) {
            throw new Error('no program provided');
        }
        states.forEach((state: State) => this._stateManager.addState(state));
    }

    public loadWord(word: string): void {
        const wordArray: Array<string> = [];
        for (let i=0; i<word.length; i++) {
            wordArray.push(word.charAt(i));
        }
        this._tape.word = wordArray;
        this._tapeSubject.next(new Event(EventType.TAPE_MOVE, {
            state: this._stateManager.currentState,
            tape: this._tape
        }));
    }

    public observeState(): Observable<Event> {
        return this._tapeSubject.asObservable();
    }

    public run(): void {
        this._subscription = interval(this._stepDelay * 5)
            .pipe(
                tap(() => this.readSymbol()),
                delay(this._stepDelay),
                map(() => this.execute()),
                delay(this._stepDelay),
                tap((executionResult: ExecutionResult) => this.writeSymbol(executionResult)),
                delay(this._stepDelay),
                tap((executionResult: ExecutionResult) => this.move(executionResult)),
                delay(this._stepDelay),
            )
            .subscribe(
                (executionResult: ExecutionResult) => this.performStep(executionResult),
                (error: Error) => this.handleError(error)
            );
    }

    private readSymbol(): void {;
        this._tapeSubject.next(new Event(EventType.SYMBOL_READ, {
            symbol: this._tape.current
        }));
    }

    private execute(): ExecutionResult {
        const executionResult: ExecutionResult = this._stateManager.execute(this._tape.current);
        this._tapeSubject.next(new Event(EventType.SYMBOL_READ, {
            symbol: executionResult.symbol
        }));
        return executionResult;
    }

    private writeSymbol(executionResult: ExecutionResult): void {;
        this._tape.writeSymbol(executionResult.symbol);
        this._tapeSubject.next(new Event(EventType.SYMBOL_WRITE, {
            state: this._stateManager.currentState,
            tape: this._tape
        }));
    }

    private move(executionResult: ExecutionResult): ExecutionResult {
        this._tape.move(executionResult.direction);
        this._tapeSubject.next(new Event(EventType.TAPE_MOVE, {
            state: this._stateManager.currentState,
            tape: this._tape
        }));
        return executionResult;
    }

    private performStep(executionResult: ExecutionResult): void {
        if (executionResult.finished) {
            this._tapeSubject.next(new Event(EventType.FINISHED));
            this._subscription.unsubscribe();
        }
    }

    private handleError(error: Error): void {
        this._subscription.unsubscribe();
        this._tapeSubject.next(new Event(EventType.ERROR, { message: error.message }));
    }

    public reset(): void {
        this._tape.reset();
        this._stateManager.reset();
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

}
