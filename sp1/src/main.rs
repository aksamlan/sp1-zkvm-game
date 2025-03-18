#![no_main]
sp1_zkvm::entrypoint!(main);

fn main() {
    let a: u32 = sp1_zkvm::io::read();
    let b: u32 = sp1_zkvm::io::read();

    let result = a + b;

    sp1_zkvm::io::write(1, &result.to_le_bytes());

    sp1_zkvm::println!("The sum of {} and {} is {}", a, b, result);
}
