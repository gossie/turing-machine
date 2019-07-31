import { Subscription } from 'rxjs';
import State from './state';
import StateManager from './state-manager';
import Tape from './tape';
import TuringMachine from './turing-machine';

const stateManager = new StateManager();
const tape: Tape = new Tape();
const turingMachine: TuringMachine = new TuringMachine(tape, stateManager);
window['turingMachine'] = turingMachine;

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

function drawArrow(): void {
    ctx.fillRect(251, 50, 10, 20);
    ctx.moveTo(245, 70);
    ctx.lineTo(267, 70);
    ctx.lineTo(256, 90);
    ctx.lineTo(245, 70);
    ctx.fill();
}

function drawTape(): void {
    ctx.moveTo(0, 100);
    ctx.lineTo(512, 100);
    ctx.moveTo(0, 124);
    ctx.lineTo(512, 124);

    for (let x=16; x<512; x+=FIELD_WIDTH) {
        ctx.moveTo(x, 100);
        ctx.lineTo(x, 124);
    }
}

function drawMachine(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawArrow();
    drawTape();

    ctx.stroke();

    ctx.font = "17px Arial";
}
drawMachine();

function drawWord(tape: Tape): void {
    const currentIndex: number = tape.currentIndex;
    for (let i=0; i<tape.word.length; i++) {
        ctx.fillText(tape.word[i], 252 + (i*FIELD_WIDTH) - (currentIndex*FIELD_WIDTH), 117);
    }
}

const subscription: Subscription = turingMachine.observeState()
    .subscribe((data: [Tape, State]) => {
        console.debug('received tape', tape);
        drawMachine();
        drawWord(data[0]);
    });

window.addEventListener('unload', () => {
    subscription.unsubscribe();
});
