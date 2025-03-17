![image](https://github.com/user-attachments/assets/93b45918-a4a4-4a75-bd90-d9f5b05f32d1)

# SP1 zkVM Game

This is a simple example demonstrating how to use SP1 (Succinct Proofs of Execution) to create and verify zero-knowledge proofs for a basic computation.

## Overview

This example:
1. Defines a simple program that adds two numbers
2. Compiles the program to run on SP1's zkVM
3. Generates a zero-knowledge proof of the computation
4. Verifies the proof

## Prerequisites

- Rust and Cargo (latest stable version)
- SP1 toolchain

## Installation

1. Install the SP1 CLI:
```bash
git clone https://github.com/succinctlabs/sp1.git
cd sp1
cargo build --release --package sp1-cli
sudo ln -s $(pwd)/target/release/sp1 /usr/local/bin/sp1
sp1 --help
```

2. Clone this repository:


```shellscript
git clone https://github.com/aksamlan/sp1-zkvm-game.git
cd sp1-zkvm-game
```

## Building the zkVM Program

Compile the program that will run inside the zkVM:

```shellscript
cd sp1
cargo build --release
```

Then, convert the compiled binary to the RISC-V format that SP1 expects:

```shellscript
sp1 build --release
cd ..
```

This will generate the `sp1_zkvm_game.riscv` file in the project root.

## Running the Example

Now you can run the main program which will generate and verify a proof:

```shellscript
cargo run --release
```

You should see output indicating that the proof was generated and verified successfully.

## How It Works

1. The program in `sp1/src/main.rs` is compiled to run on SP1's zkVM
2. The main program in `src/main.rs` provides input to this program (two numbers)
3. The zkVM program computes the sum of these numbers
4. SP1 generates a proof that the computation was performed correctly
5. The proof can be verified by anyone without revealing the input values


## Customizing

To modify the computation:

1. Edit `sp1/src/main.rs` to change the logic
2. Rebuild the zkVM program
3. Update `src/main.rs` to provide appropriate inputs


## Resources

- [SP1 GitHub Repository](https://github.com/succinctlabs/sp1)


## License

This project is licensed under the MIT License - see the LICENSE file for details.

