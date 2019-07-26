import Instruction from './instruction';

export default class State {

    private _instructions: Array<Instruction>;

    constructor(input: Array<Instruction>) {
        this._instructions = input;
    }

    public get instructions(): Array<Instruction> {
        return this._instructions;
    }
}
