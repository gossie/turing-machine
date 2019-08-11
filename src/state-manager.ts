import ExecutionResult from './execution-result';
import Instruction from './instruction';
import State from './state'

export default class StateManager {

    private _index: number = 0;
    private _states: Array<State> = [];

    public get currentState(): State {
        return this._states[this._index];
    }

    public addState(state: State): void {
        this._states.push(state);
    }

    public execute(symbol: string): ExecutionResult {
        let result: ExecutionResult = null;

        const currentState: State = this._states[this._index];
        const instruction: Instruction = currentState.instructions
                .find((instruction: Instruction) => instruction.precondition === symbol);

        if (instruction) {
            this._index = instruction.successor;
            // if (this._index < 0 || this._index >= this._states.length) {
            //     throw new Error(`No state found for index ${this._index}`);
            // }
            result = new ExecutionResult(instruction.postcondition, instruction.direction, this._states[this._index].instructions.length == 0);
        } else {
            // throw new Error(`No instruction found for symbol ${symbol}`);
        }

        return result;
    }

    public reset(): void {
        this._index = 0;
        this._states = [];
    }

}