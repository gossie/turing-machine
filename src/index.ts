import { Subscription } from 'rxjs';
import Event from './event';
import { EventType } from './event-type';
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

function drawSymbolBox(): void {
    const x = 240;
    ctx.clearRect(x, 16, FIELD_WIDTH, 24);
    ctx.strokeRect(x, 16, FIELD_WIDTH, 24);
}

function drawSymbolInBox(symbol: string): void {
    ctx.clearRect(241, 101, 30, 22);
    ctx.clearRect(241, 17, 30, 22);
    ctx.font = '17px Arial';
    ctx.fillText(symbol, 251, 33);
}

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

    for (let x = 16; x < 512; x += FIELD_WIDTH) {
        ctx.moveTo(x, 100);
        ctx.lineTo(x, 124);
    }
    ctx.stroke();
}

function drawMachine(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSymbolBox();
    drawArrow();
    drawTape();

    try {
        ctx.font = '17px Arial';
    } catch (e) { }
}
drawMachine();
function drawWord(tape: Tape): void {
    const currentIndex: number = tape.currentIndex;
    tape.word.forEach((letter, i) => ctx.fillText(letter, 252 + (i*FIELD_WIDTH) - (currentIndex*FIELD_WIDTH), 117));
}

const subscription: Subscription = turingMachine.observeState()
    .subscribe((event: Event) => {
        if (event.type === EventType.TAPE_MOVE || event.type === EventType.SYMBOL_WRITE) {
            drawMachine();
            drawWord(event.payload['tape']);
        } else if (event.type === EventType.SYMBOL_READ) {
            drawSymbolInBox(event.payload['symbol']);
        }
    });

window.addEventListener('unload', () => {
    subscription.unsubscribe();
});
