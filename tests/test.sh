#!/bin/bash

set -euo pipefail

# Function to compare expected output with actual output
# Usage: compare_output <expected_output> <actual_output>
compare_output() {
    local expected_output="$1"
    local actual_output="$2"

    if [ "$actual_output" != "$expected_output" ]; then
        echo "Output does not match expected output."
        echo "Expected: $expected_output"
        echo "Got: $actual_output"
        return 1
    else
        echo "Output matches expected output."
        return 0
    fi
}

# Function to perform a test and handle failure
# Usage: run_test <test_name> <expected_output> <actual_output>
run_test() {
    local test_name="$1"
    local expected_output="$2"
    local actual_output="$3"

    echo "Testing $test_name"
    if ! compare_output "$expected_output" "$actual_output"; then
        isFailed=true
    fi
}

# Build the npm package
cd ../
npm install
npm run build
cd -

isFailed=false

# Function to stop the spin app
cleanup() {
    echo "Stopping Spin"
    killall spin 2>/dev/null || true
}
trap cleanup EXIT

##############################################
# Test webpack app
##############################################
echo "=== Testing webpack app ==="

# Build test app
echo "Building the test app (webpack)"
cd test-app
npm install > /dev/null
spin build > /dev/null
echo "Built the webpack test app successfully"

# Start the spin app in the background
echo "Starting Spin app"
spin up -e FOO=BAR &

# Wait for app to be up and running
echo "Waiting for Spin app to be ready"
timeout 60s bash -c 'until curl --silent -f http://localhost:3000/health > /dev/null; do sleep 2; done'

# Start the tests
echo -e "Starting tests\n"

# Test fs.readFileSync
expected_output_fs_readfileSync=$(cat "./assets/test.txt")
actual_output_fs_readfileSync=$(curl -s localhost:3000/testReadFile)
run_test "fs.readFileSync (webpack)" "$expected_output_fs_readfileSync" "$actual_output_fs_readfileSync"

# Test process.env
actual_output_process_env=$(curl -s localhost:3000/testEnvVars)
expected_output_process_env="{\"FOO\":\"BAR\"}"
run_test "process.env (webpack)" "$expected_output_process_env" "$actual_output_process_env"

# Stop the spin app
killall spin 2>/dev/null || true
sleep 1

##############################################
# Test esbuild app (same app, build profile)
##############################################
echo -e "\n=== Testing esbuild app ==="

echo "Building the test app (esbuild)"
spin build --profile esbuild > /dev/null
echo "Built the esbuild test app successfully"

# Start the spin app in the background
echo "Starting Spin app"
spin up --profile esbuild -e FOO=BAR &

# Wait for app to be up and running
echo "Waiting for Spin app to be ready"
timeout 60s bash -c 'until curl --silent -f http://localhost:3000/health > /dev/null; do sleep 2; done'

# Start the tests
echo -e "Starting tests\n"

# Test fs.readFileSync
expected_output_fs_readfileSync=$(cat "./assets/test.txt")
actual_output_fs_readfileSync=$(curl -s localhost:3000/testReadFile)
run_test "fs.readFileSync (esbuild)" "$expected_output_fs_readfileSync" "$actual_output_fs_readfileSync"

# Test process.env
actual_output_process_env=$(curl -s localhost:3000/testEnvVars)
expected_output_process_env="{\"FOO\":\"BAR\"}"
run_test "process.env (esbuild)" "$expected_output_process_env" "$actual_output_process_env"

cd ..

echo -e "\n\nTests completed"

# Check if any tests failed and exit with status 1 if so
if [ "$isFailed" = true ] ; then
    exit 1
fi
