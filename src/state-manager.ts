import ExecutionResult from './execution-result';
import Instruction from './instruction';
import State from './state';

export default class StateManager {

    private index: number = 0;
    private states: Array<State> = [];

    public get currentState(): State {
        return this.states[this.index];
    }

    public addState(state: State): void {
        this.states.push(state);
    }

    public execute(symbol: string): ExecutionResult {
        let result: ExecutionResult = null;

        const currentState: State = this.states[this.index];
        const instruction: Instruction = currentState.instructions
                .find((i) => i.precondition === symbol);

        if (instruction) {
            this.index = instruction.successor;
            if (this.index < 0 || this.index >= this.states.length) {
                throw new Error(`No state found for index ${this.index}`);
            }
            result = new ExecutionResult(
                instruction.postcondition,
                instruction.direction,
                this.states[this.index].instructions.length === 0
            );
        } else {
            throw new Error(`No instruction found for symbol ${symbol}`);
        }

        return result;
    }

    public reset(): void {
        this.index = 0;
        this.states = [];
    }

}
