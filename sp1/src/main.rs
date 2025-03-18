sp1_zkvm::entrypoint!(main);

fn main() {
    // Read the input values
    let a: u32 = sp1_zkvm::io::read();
    let b: u32 = sp1_zkvm::io::read();

    // Perform a simple computation
    let result = a + b;

    // Option 1: Write the result as raw bytes (if required for output)
    // Not usually helpful for humans unless you're expecting raw u32 data
    // You need to serialize it to bytes properly in most cases
    sp1_zkvm::io::write(1, &result.to_le_bytes());

    // Option 2: Log a human-readable message (this is usually for debugging/logging)
    let output = format!("The sum of {} and {} is {}", a, b, result);
    sp1_zkvm::io::write(1, output.as_bytes());
}
