#![no_main]
sp1_zkvm::entrypoint!(main);

fn main() {
    // Read the input values
    let a: u32 = sp1_zkvm::io::read();
    let b: u32 = sp1_zkvm::io::read();
    
    // Perform a simple computation
    let result = a + b;
    
    // Write the result
    sp1_zkvm::io::write(&result);
    
    // Log the result (visible during proving)
    sp1_zkvm::println!("The sum of {} and {} is {}", a, b, result);
}
