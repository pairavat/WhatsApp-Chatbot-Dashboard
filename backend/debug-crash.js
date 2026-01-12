// Debug script to find where the app is crashing
console.log("=".repeat(70));
console.log("🔍 DEBUGGING SERVER CRASH");
console.log("=".repeat(70));
console.log("");

// Catch all errors
process.on("uncaughtException", (error) => {
  console.error("");
  console.error("💥 UNCAUGHT EXCEPTION:");
  console.error("=".repeat(70));
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  console.error("=".repeat(70));
  console.error("");
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("");
  console.error("💥 UNHANDLED REJECTION:");
  console.error("=".repeat(70));
  console.error("Reason:", reason);
  console.error("Promise:", promise);
  console.error("=".repeat(70));
  console.error("");
  process.exit(1);
});

console.log("Step 1: Loading environment variables...");
require("dotenv").config();
console.log("✅ Environment variables loaded");
console.log("");

console.log("Step 2: Checking critical environment variables...");
const requiredVars = ["MONGODB_URI", "JWT_SECRET", "PORT"];
requiredVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.error(`❌ ${varName}: MISSING`);
  }
});
console.log("");

console.log("Step 3: Attempting to import server...");
try {
  require("./src/server.ts");
  console.log("✅ Server imported successfully");
} catch (error) {
  console.error("");
  console.error("💥 IMPORT ERROR:");
  console.error("=".repeat(70));
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  console.error("=".repeat(70));
  console.error("");
  console.error("This error occurred while trying to import/execute server.ts");
  console.error("");
  process.exit(1);
}
