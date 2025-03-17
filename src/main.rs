use sp1_sdk::{
    ProverClient, SP1Prover, SP1Stdin, SP1Verifier,
    utils::setup_logger,
};

fn main() {
    // Initialize the logger
    setup_logger();

    // Define the program input
    let mut stdin = SP1Stdin::new();
    
    // Add two numbers: 42 and 27
    stdin.write(&42u32);
    stdin.write(&27u32);

    // Create a prover instance
    let prover = SP1Prover::new(
        "sp1_zkvm_example".to_string(),
        include_bytes!("../sp1_zkvm_example.riscv"),
    );

    // Generate a proof
    println!("Generating proof...");
    let proof = prover.prove(stdin).expect("Failed to generate proof");
    println!("Proof generated successfully!");

    // Verify the proof
    println!("Verifying proof...");
    let verifier = SP1Verifier::new(
        "sp1_zkvm_example".to_string(),
        include_bytes!("../sp1_zkvm_example.riscv"),
    );
    verifier.verify(proof).expect("Failed to verify proof");
    println!("Proof verified successfully!");
}
