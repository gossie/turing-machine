import { Direction } from './direction';
import Event from './event';
import { EventType } from './event-type';
import Instruction from './instruction';
import State from './state';
import StateManager from './state-manager';
import Tape from './tape';
import TuringMachine from './turing-machine';

describe('Turing Machine', () => {

    describe('no program', () => {

        it('should throw an error when an empty program is provided', () => {
            const turingMachine = new TuringMachine(new Tape(), new StateManager());
            expect(() => turingMachine.loadProgram([])).toThrowError('no program provided');
        });

        it('should throw an error when null is provided as program', () => {
            const turingMachine = new TuringMachine(new Tape(), new StateManager());
            expect(() => turingMachine.loadProgram(null)).toThrowError('no program provided');
        });

        it('should throw an error when undefined is provided as program', () => {
            const turingMachine = new TuringMachine(new Tape(), new StateManager());
            expect(() => turingMachine.loadProgram(undefined)).toThrowError('no program provided');
        });

    });

    describe('interpretation errors', () => {

        it('should throw an error because no instruction is found', (done) => {
            const states = [
                new State([
                    new Instruction('b', 'a', Direction.RIGHT, 0),
                    new Instruction('_', '_', Direction.RIGHT, 1),
                ]),
                new State([])
            ];

            const tape = new Tape();
            const turingMachine = new TuringMachine(tape, new StateManager(), 100);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('a');

            const actualEvents = [];
            const expectedEvents = [
                new Event(EventType.SYMBOL_READ, { symbol: 'a' }),
                new Event(EventType.ERROR, { message: 'No instruction found for symbol a' })
            ];
            const subscription = turingMachine.observeState()
                .subscribe((event: Event) => {
                    actualEvents.push(event);
                    if (actualEvents.length === expectedEvents.length) {
                        expect(actualEvents).toEqual(expectedEvents);
                        subscription.unsubscribe();
                        done();
                    }
                });

            turingMachine.run();
        });

        it('should throw an error because no state is found', (done) => {
            const states = [
                new State([
                    new Instruction('b', 'a', Direction.RIGHT, 2),
                    new Instruction('_', '_', Direction.RIGHT, 1),
                ]),
                new State([])
            ];

            const tape = new Tape();
            const turingMachine = new TuringMachine(tape, new StateManager(), 100);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('b');

            const actualEvents = [];
            const expectedEvents = [
                new Event(EventType.SYMBOL_READ, { symbol: 'b' }),
                new Event(EventType.ERROR, { message: 'No state found for index 2' })
            ];
            const subscription = turingMachine.observeState()
                .subscribe((event: Event) => {
                    actualEvents.push(event);
                    if (actualEvents.length === expectedEvents.length) {
                        expect(actualEvents).toEqual(expectedEvents);
                        subscription.unsubscribe();
                        done();
                    }
                });

            turingMachine.run();
        });

    });

    describe('running program', () => {

        it('should run', (done) => {
            const states = [
                new State([
                    new Instruction('a', 'b', Direction.RIGHT, 0),
                    new Instruction('b', 'a', Direction.RIGHT, 0),
                    new Instruction('_', '_', Direction.RIGHT, 1),
                ]),
                new State([])
            ];

            const tape = new Tape();
            const turingMachine = new TuringMachine(tape, new StateManager(), 100);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('ab');

            const actualEvents = [];
            const expectedEvents = [
                new Event(EventType.SYMBOL_READ, { symbol: 'a' }),
                new Event(EventType.SYMBOL_READ, { symbol: 'b' }),
                new Event(EventType.SYMBOL_WRITE, { state: states[0], tape }),
                new Event(EventType.TAPE_MOVE, { state: states[0], tape }),
                new Event(EventType.SYMBOL_READ, { symbol: 'b' }),
                new Event(EventType.SYMBOL_READ, { symbol: 'a' }),
                new Event(EventType.SYMBOL_WRITE, { state: states[0], tape }),
                new Event(EventType.TAPE_MOVE, { state: states[0], tape }),
                new Event(EventType.SYMBOL_READ, { symbol: '_' }),
                new Event(EventType.SYMBOL_READ, { symbol: '_' }),
                new Event(EventType.SYMBOL_WRITE, { state: states[1], tape }),
                new Event(EventType.TAPE_MOVE, { state: states[1], tape }),
                new Event(EventType.FINISHED)
            ];
            const subscription = turingMachine.observeState()
                .subscribe((event: Event) => {
                    actualEvents.push(event);
                    if (actualEvents.length === expectedEvents.length) {
                        expect(actualEvents).toEqual(expectedEvents);
                        subscription.unsubscribe();
                        done();
                    }
                });

            turingMachine.run();
        });

    });

});
