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
            const turingMachine = new TuringMachine(tape, new StateManager(), 10);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('a');

            const actualEvents = [];
            const expectedEvents = [
                new Event(EventType.SYMBOL_READ, 'read', { symbol: 'a' }),
                new Event(EventType.ERROR, 'error', { message: 'No instruction found for symbol a' })
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
            const turingMachine = new TuringMachine(tape, new StateManager(), 10);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('b');

            const actualEvents = [];
            const expectedEvents = [
                new Event(EventType.SYMBOL_READ, 'read', { symbol: 'b' }),
                new Event(EventType.ERROR, 'error', { message: 'No state found for index 2' })
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
            const turingMachine = new TuringMachine(tape, new StateManager(), 10);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('ab');

            const actualEvents = [];
            const expectedEvents = [
                new Event(EventType.SYMBOL_READ, 'read', { symbol: 'a' }),
                new Event(EventType.SYMBOL_READ, 'execute', { symbol: 'b' }),
                new Event(EventType.SYMBOL_WRITE, 'write', { state: states[0], tape }),
                new Event(EventType.TAPE_MOVE, 'move', { state: states[0], tape }),
                new Event(EventType.SYMBOL_READ, 'read', { symbol: 'b' }),
                new Event(EventType.SYMBOL_READ, 'execute', { symbol: 'a' }),
                new Event(EventType.SYMBOL_WRITE, 'write', { state: states[0], tape }),
                new Event(EventType.TAPE_MOVE, 'move', { state: states[0], tape }),
                new Event(EventType.SYMBOL_READ, 'read', { symbol: '_' }),
                new Event(EventType.SYMBOL_READ, 'execute', { symbol: '_' }),
                new Event(EventType.SYMBOL_WRITE, 'write', { state: states[1], tape }),
                new Event(EventType.TAPE_MOVE, 'move', { state: states[1], tape }),
                new Event(EventType.FINISHED, 'finished')
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

    describe('debugging', () => {

        it('should throw error if execution is paused', (done) => {
            const states = [
                new State([
                    new Instruction('a', 'b', Direction.RIGHT, 0),
                    new Instruction('b', 'a', Direction.RIGHT, 0),
                    new Instruction('_', '_', Direction.RIGHT, 1),
                ]),
                new State([])
            ];

            const tape = new Tape();
            const turingMachine = new TuringMachine(tape, new StateManager(), 10);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('ab');

            const actualEvents: Array<Event> = [];
            const subscription = turingMachine.observeState()
                .subscribe((event: Event) => {
                    actualEvents.push(event);
                    fail('events are not expected');
                });

            turingMachine.run();
            turingMachine.pause();

            setTimeout(() => {
                subscription.unsubscribe();
                expect(actualEvents).toEqual([]);
                turingMachine.reset();
                done();
            }, 500);
        });

        it('should run after pause', (done) => {
            const states = [
                new State([
                    new Instruction('a', 'b', Direction.RIGHT, 0),
                    new Instruction('b', 'a', Direction.RIGHT, 0),
                    new Instruction('_', '_', Direction.RIGHT, 1),
                ]),
                new State([])
            ];

            const tape = new Tape();
            const turingMachine = new TuringMachine(tape, new StateManager(), 10);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('ab');

            const actualEvents = [];
            const expectedEvents = [
                new Event(EventType.SYMBOL_READ, 'read', { symbol: 'a' }),
                new Event(EventType.SYMBOL_READ, 'execute', { symbol: 'b' }),
                new Event(EventType.SYMBOL_WRITE, 'write', { state: states[0], tape }),
                new Event(EventType.TAPE_MOVE, 'move', { state: states[0], tape }),
                new Event(EventType.SYMBOL_READ, 'read', { symbol: 'b' }),
                new Event(EventType.SYMBOL_READ, 'execute', { symbol: 'a' }),
                new Event(EventType.SYMBOL_WRITE, 'write', { state: states[0], tape }),
                new Event(EventType.TAPE_MOVE, 'move', { state: states[0], tape }),
                new Event(EventType.SYMBOL_READ, 'read', { symbol: '_' }),
                new Event(EventType.SYMBOL_READ, 'execute', { symbol: '_' }),
                new Event(EventType.SYMBOL_WRITE, 'write', { state: states[1], tape }),
                new Event(EventType.TAPE_MOVE, 'move', { state: states[1], tape }),
                new Event(EventType.FINISHED, 'finished')
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
            turingMachine.pause();
            turingMachine.unpause();
        });

        it('should step through the program', (done) => {
            const states = [
                new State([
                    new Instruction('a', 'b', Direction.RIGHT, 0),
                    new Instruction('b', 'a', Direction.RIGHT, 0),
                    new Instruction('_', '_', Direction.RIGHT, 1),
                ]),
                new State([])
            ];

            const tape = new Tape();
            const turingMachine = new TuringMachine(tape, new StateManager(), 10);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('ab');

            const subscription = turingMachine.observeState()
                .subscribe((event: Event) => {
                    expect(event).toEqual(new Event(EventType.SYMBOL_READ, 'read', { symbol: 'a' }));
                    subscription.unsubscribe();
                    turingMachine.reset();
                    done();
                });

            turingMachine.run();
            turingMachine.pause();
            turingMachine.step();
        });

        it('should pass the finished check when debugging', (done) => {
            const states = [
                new State([
                    new Instruction('a', 'b', Direction.RIGHT, 0),
                    new Instruction('b', 'a', Direction.RIGHT, 0),
                    new Instruction('_', '_', Direction.RIGHT, 1),
                ]),
                new State([])
            ];

            const tape = new Tape();
            const turingMachine = new TuringMachine(tape, new StateManager(), 10);
            turingMachine.loadProgram(states);
            turingMachine.loadWord('ab');

            let recordEvents = false;
            const recordedEvents: Array<Event> = [];
            const subscription = turingMachine.observeState()
                .subscribe((event: Event) => {
                    if (event.type === EventType.SYMBOL_WRITE) {
                        turingMachine.pause();
                        recordEvents = true;
                        setTimeout(() => {
                            turingMachine.step();
                            setTimeout(() => turingMachine.step());
                        });
                    } else {
                        if (recordEvents) {
                            recordedEvents.push(event);
                        }

                        if (recordedEvents.length === 2) {
                            expect(recordedEvents).toEqual([
                                new Event(EventType.TAPE_MOVE, 'move', { state: states[0], tape }),
                                new Event(EventType.SYMBOL_READ, 'read', { symbol: 'b' }),
                            ]);
                            subscription.unsubscribe();
                            turingMachine.reset();
                            done();
                        }
                    }
                });

            turingMachine.run();
        });

    });

});
