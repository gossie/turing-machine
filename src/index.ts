import Instruction from './instruction';
import State from './state';
import StateManager from './state-manager';
import Tape from './tape';
import TuringMachine from './turing-machine';

const stateManager = new StateManager();
const tape: Tape = new Tape();
const turingMachine: TuringMachine = new TuringMachine(tape, stateManager);

const FIELD_WIDTH: number = 32;

const canvas: HTMLCanvasElement = document.createElement('canvas');
canvas.width = 512;
canvas.height = 224;

canvas.style.cssText = 'image-rendering: optimizeSpeed;' + // FireFox < 6.0
    'image-rendering: -moz-crisp-edges;' + // FireFox
    'image-rendering: -o-crisp-edges;' +  // Opera
    'image-rendering: -webkit-crisp-edges;' + // Chrome
    'image-rendering: crisp-edges;' + // Chrome
    'image-rendering: -webkit-optimize-contrast;' + // Safari
    'image-rendering: pixelated; ' + // Future browsers
    '-ms-interpolation-mode: nearest-neighbor;'; // IE

document.getElementById('canvas').appendChild(canvas);

const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

function drawMachine() {
    console.debug('drawMachine');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillRect(251, 50, 10, 20);
    ctx.moveTo(245, 70);
    ctx.lineTo(267, 70);
    ctx.lineTo(256, 90);
    ctx.lineTo(245, 70);
    ctx.fill();

    ctx.moveTo(0, 100);
    ctx.lineTo(512, 100);
    ctx.moveTo(0, 124);
    ctx.lineTo(512, 124);

    for (let x=16; x<512; x+=FIELD_WIDTH) {
        ctx.moveTo(x, 100);
        ctx.lineTo(x, 124);
    }

    ctx.stroke();

    ctx.font = "17px Arial";
}
drawMachine();

function instructionToDiv(instruction: Instruction): string {
    return `<div>if input equals ${instruction.precondition} then output = ${instruction.postcondition}; direction = ${instruction.direction}; nextState = ${instruction.successor} </div>`;
}

let instructionsForNextState = [];
document.getElementById('instruction-button').addEventListener('click', () => {
    const inputSymbol: HTMLFormElement = document.getElementById('input-new') as HTMLFormElement;
    const outputSymbol: HTMLFormElement = document.getElementById('output-new') as HTMLFormElement;
    const direction: HTMLFormElement = document.getElementById('direction-new') as HTMLFormElement;
    const nextState: HTMLFormElement = document.getElementById('next-state-new') as HTMLFormElement;
    instructionsForNextState.push(new Instruction(inputSymbol.value, outputSymbol.value, direction.value, parseInt(nextState.value)));
    console.debug('instructions', instructionsForNextState);
    document.getElementById('instructions').innerHTML = instructionsForNextState
            .map(instructionToDiv)
            .join('');
});

const states: Array<State> = [];
document.getElementById('state-button').addEventListener('click', () => {
    states.push(new State(instructionsForNextState));
    document.getElementById('states').innerHTML = states
            .map((state: State, index) => `<div><div>State ${index}</div><div>${state.instructions.map(instructionToDiv).join('')}</div></div>`)
            .join('');
    instructionsForNextState = [];
    document.getElementById('instructions').innerHTML = '';
});

function drawTape(tape: Tape): void {
    const currentIndex: number = tape.currentIndex;
    for (let i=0; i<tape.word.length; i++) {
        ctx.fillText(tape.word[i], 252 + (i*FIELD_WIDTH) - (currentIndex*FIELD_WIDTH), 117);
    }
}

turingMachine.observeState()
    .subscribe((tape: Tape) => {
        console.debug('received tape', tape);
        drawMachine();
        drawTape(tape);
    });

document.getElementById('run-button').addEventListener('click', () => {
    const wordField: HTMLFormElement = document.getElementById('word') as HTMLFormElement;
    turingMachine.reset();
    turingMachine.loadWord(wordField.value);
    turingMachine.loadProgram(states);

    try {
        turingMachine.run();
    } catch(e) {
        console.error(e);
    }
});
