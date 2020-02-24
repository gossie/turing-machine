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
    private steps = new Map<number, () => void>([
        [0, () => this.readSymbol()],
        [1, () => this.execute()],
        [2, () => this.writeSymbol(this.lastExecutionResult)],
        [3, () => this.move(this.lastExecutionResult)],
        [4, () => this.handleFinishIfNecessary()]
    ]);

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
        this.tapeSubject.next(new Event(EventType.TAPE_MOVE, 'move', {
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
        this.tapeSubject.next(new Event(EventType.SYMBOL_READ, 'read', {
            symbol: this.tape.current
        }));
    }

    private execute(): void {
        this.lastExecutionResult = this.stateManager.execute(this.tape.current);
        this.tapeSubject.next(new Event(EventType.SYMBOL_READ, 'execute', {
            symbol: this.lastExecutionResult.symbol
        }));
    }

    private writeSymbol(executionResult: ExecutionResult): void {;
        this.tape.writeSymbol(executionResult.symbol);
        this.tapeSubject.next(new Event(EventType.SYMBOL_WRITE, 'write', {
            state: this.stateManager.currentState,
            tape: this.tape
        }));
    }

    private move(executionResult: ExecutionResult): void {
        this.tape.move(executionResult.direction);
        this.tapeSubject.next(new Event(EventType.TAPE_MOVE, 'move', {
            state: this.stateManager.currentState,
            tape: this.tape
        }));
    }

    private handleFinishIfNecessary(): void {
        if (this.lastExecutionResult.finished) {
            this.tapeSubject.next(new Event(EventType.FINISHED, 'finished'));
            this.subscription.unsubscribe();
        }
    }

    private performStep(force: boolean = false): void {
        if (!this.paused || force) {
            this.steps.get(this.currentState)();
            this.currentState < 4 ? ++this.currentState : this.currentState = 0;
        }
    }

    private handleError(error: Error): void {
        this.subscription.unsubscribe();
        this.tapeSubject.next(new Event(EventType.ERROR, 'error', { message: error.message }));
    }

}
