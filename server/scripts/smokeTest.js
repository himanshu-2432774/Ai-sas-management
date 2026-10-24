const path = require("node:path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const API_BASE_URL =
  process.env.API_BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;

let failedTests = 0;

function logErrorDetails(error) {
  if (!(error instanceof Error)) {
    console.error("   Failure details:", error);
    return;
  }

  console.error(`   ${error.name}: ${error.message}`);

  let cause = error.cause;
  while (cause instanceof Error) {
    const details = [
      cause.name,
      cause.message,
      cause.code && `code=${cause.code}`,
      cause.syscall && `syscall=${cause.syscall}`,
      cause.address && `address=${cause.address}`,
      cause.port && `port=${cause.port}`,
    ].filter(Boolean);

    console.error(`   Caused by: ${details.join("; ")}`);
    cause = cause.cause;
  }
}

async function runTest(name, testFunction) {
  try {
    await testFunction();
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    failedTests++;
    console.error(`❌ FAIL: ${name}`);
    logErrorDetails(error);
  }
}

async function main() {
  // Test 1: Health endpoint
  await runTest("Health endpoint responds with HTTP 200", async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (response.status !== 200) {
      throw new Error(`Expected 200, received ${response.status}`);
    }
  });

  // Test 2: Invalid login must be rejected
  await runTest("Unknown login credentials are rejected with HTTP 404", async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `smoke-test-invalid-${process.pid}-${Date.now()}@example.com`,
        password: "DefinitelyNotTheCorrectPassword123!",
      }),
    });

    if (response.status !== 404) {
      throw new Error(`Expected HTTP 404 for an unknown user, received ${response.status}`);
    }
  });

  console.log("\n--- Smoke test summary ---");

  if (failedTests === 0) {
    console.log("All smoke tests passed.");
  } else {
    console.log(`${failedTests} test(s) failed.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Smoke test could not complete:");
  logErrorDetails(error);
  process.exitCode = 1;
});