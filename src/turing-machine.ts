import { interval, Observable, Subject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import Event from './event';
import { EventType } from './event-type';
import ExecutionResult from './execution-result';
import State from './state';
import StateManager from './state-manager';
import Tape from './tape';

export default class TuringMachine {

    private paused: boolean = false;
    private tape: Tape;
    private stateManager: StateManager;
    private stepDelay: number;
    private tapeSubject: Subject<Event> = new Subject();
    private subscription: Subscription;
    private currentState = 0;
    private lastExecutionResult: ExecutionResult = undefined;

    constructor(tape: Tape, stateManager: StateManager, stepDelay: number = 250) {
        this.tape = tape;
        this.stateManager = stateManager;
        this.stepDelay = stepDelay;
    }

    public loadProgram(states: Array<State>): void {
        if (!states || states.length === 0) {
            throw new Error('no program provided');
        }
        states.forEach((state: State) => this.stateManager.addState(state));
    }

    public loadWord(word: string): void {
        const wordArray: Array<string> = [];
        for (let i = 0; i < word.length; i++) {
            wordArray.push(word.charAt(i));
        }
        this.tape.word = wordArray;
        this.tapeSubject.next(new Event(EventType.TAPE_MOVE, {
            state: this.stateManager.currentState,
            tape: this.tape
        }));
    }

    public observeState(): Observable<Event> {
        return this.tapeSubject.asObservable();
    }

    public pause(): void {
        this.paused = true;
    }

    public unpause(): void {
        this.paused = false;
    }

    public reset(): void {
        this.tape.reset();
        this.stateManager.reset();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public step(): void {
        if (!this.subscription.closed){
            this.performStep(true);
            if (this.currentState === 4) {
                this.performStep(true);
            }
        }
    }

    public run(): void {
        this.subscription = interval(this.stepDelay)
            .pipe(
                tap(() => this.performStep())
            )
            .subscribe(
                () => console.debug('step was performed'),
                (error: Error) => this.handleError(error)
            );
    }

    private readSymbol(): void {;
        this.tapeSubject.next(new Event(EventType.SYMBOL_READ, {
            symbol: this.tape.current
        }));
    }

    private execute(): ExecutionResult {
        const executionResult: ExecutionResult = this.stateManager.execute(this.tape.current);
        this.tapeSubject.next(new Event(EventType.SYMBOL_READ, {
            symbol: executionResult.symbol
        }));
        return executionResult;
    }

    private writeSymbol(executionResult: ExecutionResult): void {;
        this.tape.writeSymbol(executionResult.symbol);
        this.tapeSubject.next(new Event(EventType.SYMBOL_WRITE, {
            state: this.stateManager.currentState,
            tape: this.tape
        }));
    }

    private move(executionResult: ExecutionResult): ExecutionResult {
        this.tape.move(executionResult.direction);
        this.tapeSubject.next(new Event(EventType.TAPE_MOVE, {
            state: this.stateManager.currentState,
            tape: this.tape
        }));
        return executionResult;
    }

    private performStep(force: boolean = false): void {
        if (!this.paused || force) {
            if (this.currentState === 0) {
                this.readSymbol();
                ++this.currentState;
            } else if (this.currentState === 1) {
                this.lastExecutionResult = this.execute();
                ++this.currentState;
            } else if (this.currentState === 2) {
                this.writeSymbol(this.lastExecutionResult);
                ++this.currentState;
            } else if (this.currentState === 3) {
                this.lastExecutionResult = this.move(this.lastExecutionResult);
                ++this.currentState;
            } else if (this.currentState === 4) {
                if (this.lastExecutionResult.finished) {
                    this.tapeSubject.next(new Event(EventType.FINISHED));
                    this.subscription.unsubscribe();
                }
                this.currentState = 0;
            }
        }
    }

    private handleError(error: Error): void {
        this.subscription.unsubscribe();
        this.tapeSubject.next(new Event(EventType.ERROR, { message: error.message }));
    }

}
