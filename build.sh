```bash
#!/bin/bash
set -e

echo "Building SP1 zkVM program..."
cd sp1
cargo build --release
sp1 build --release
cd ..

echo "Building main program..."
cargo build --release

echo "Build completed successfully!"
echo "Run with: cargo run --release"
