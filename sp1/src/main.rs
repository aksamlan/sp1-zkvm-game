#![no_main]

sp1_zkvm::entrypoint!(main);

fn main() {
    let a = 2;
    let b = 3;
    let result = a + b;

    // Correct output
    sp1_zkvm::io::write_stdout(format!("The sum of {} and {} is {}", a, b, result));
}
