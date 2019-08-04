[![Build Status](https://travis-ci.org/gossie/turing-machine.svg?branch=master)](https://travis-ci.org/gossie/turing-machine)

# Turing Machine

Want to try it out without further reading? [https://gossie.github.io/turing-machine](https://gossie.github.io/turing-machine/)

To find out how a Turing machine works in general: [https://en.wikipedia.org/wiki/Turing_machine](https://en.wikipedia.org/wiki/Turing_machine)
This Turing Machine is implemented in [TypeScript](https://www.typescriptlang.org/) using a canvas for the rendering and a small [Vue](https://vuejs.org/) for the configuration.
The Turing Machine applies to the following rules:
* You can define states that describe the program.
* A state consists of a Instructions.
* In each state the current letter is read from the tape and the instruction to be executed is identified. The output is written back to the tape, the cursor is moved in the direction and the next state is executed.
* Empty fields on the tape are represented with an '_'.
* The program is finished when the final state is reached.
A state with no instructions is the final state.

Try out this [implementation](https://gossie.github.io/turing-machine/).
