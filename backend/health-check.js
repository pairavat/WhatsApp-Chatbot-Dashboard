const fs = require("fs");
const path = require("path");

console.log("=".repeat(70));
console.log("🔍 COMPREHENSIVE BACKEND HEALTH CHECK");
console.log("=".repeat(70));
console.log("");

let issues = [];
let warnings = [];

// Test 1: Check if .env file exists
console.log("📋 Test 1: Environment Configuration");
console.log("-".repeat(70));

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  console.log("✅ .env file exists");

  // Load and check environment variables
  require("dotenv").config();

  const requiredVars = ["MONGODB_URI", "JWT_SECRET", "PORT"];
  const optionalVars = ["REDIS_HOST", "REDIS_PORT", "FRONTEND_URL"];

  console.log("");
  console.log("Required variables:");
  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`  ✅ ${varName}: SET`);
    } else {
      console.log(`  ❌ ${varName}: MISSING`);
      issues.push(`Missing required environment variable: ${varName}`);
    }
  });

  console.log("");
  console.log("Optional variables:");
  optionalVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`  ✅ ${varName}: SET`);
    } else {
      console.log(`  ⚠️  ${varName}: NOT SET (optional)`);
    }
  });
} else {
  console.log("❌ .env file not found");
  issues.push(".env file is missing");
}

console.log("");

// Test 2: Check TypeScript compilation
console.log("📋 Test 2: TypeScript Compilation");
console.log("-".repeat(70));

const { execSync } = require("child_process");

try {
  console.log("⏳ Running TypeScript compiler...");
  execSync("npx tsc --noEmit", { stdio: "pipe", timeout: 30000 });
  console.log("✅ TypeScript compilation: OK");
} catch (error) {
  console.log("❌ TypeScript compilation: FAILED");
  console.log("");
  console.log("Errors:");
  console.log(error.stdout?.toString() || error.message);
  issues.push("TypeScript compilation errors");
}

console.log("");

// Test 3: Check critical files
console.log("📋 Test 3: Critical Files Check");
console.log("-".repeat(70));

const criticalFiles = [
  "src/server.ts",
  "src/config/database.ts",
  "src/config/logger.ts",
  "src/middleware/errorHandler.ts",
  "package.json",
  "tsconfig.json",
];

criticalFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
    issues.push(`Missing critical file: ${file}`);
  }
});

console.log("");

// Test 4: Check node_modules
console.log("📋 Test 4: Dependencies");
console.log("-".repeat(70));

const nodeModulesPath = path.join(__dirname, "node_modules");
if (fs.existsSync(nodeModulesPath)) {
  console.log("✅ node_modules directory exists");

  // Check critical dependencies
  const criticalDeps = [
    "express",
    "mongoose",
    "dotenv",
    "winston",
    "typescript",
  ];

  console.log("");
  console.log("Critical dependencies:");
  criticalDeps.forEach((dep) => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep}`);
      issues.push(`Missing dependency: ${dep}`);
    }
  });
} else {
  console.log("❌ node_modules directory not found");
  issues.push("Dependencies not installed");
  console.log("");
  console.log("💡 Run: npm install");
}

console.log("");

// Test 5: Check for process.exit in main server file
console.log("📋 Test 5: Server Crash Prevention");
console.log("-".repeat(70));

const serverPath = path.join(__dirname, "src", "server.ts");
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, "utf8");

  // Check for dangerous process.exit calls
  const exitMatches = serverContent.match(/process\.exit\(1\)/g);
  const dangerousExits = [];

  // Check if exits are in error handlers
  if (
    serverContent.includes("unhandledRejection") &&
    serverContent.includes("process.exit(1)")
  ) {
    dangerousExits.push("unhandledRejection handler has process.exit(1)");
  }
  if (
    serverContent.includes("uncaughtException") &&
    serverContent.includes("process.exit(1)")
  ) {
    dangerousExits.push("uncaughtException handler has process.exit(1)");
  }

  if (dangerousExits.length > 0) {
    console.log("❌ Found dangerous process.exit calls:");
    dangerousExits.forEach((exit) => {
      console.log(`  ⚠️  ${exit}`);
      warnings.push(exit);
    });
  } else {
    console.log("✅ No dangerous process.exit calls found");
  }

  // Check for proper error handling
  if (serverContent.includes("try {") && serverContent.includes("catch")) {
    console.log("✅ Error handling present");
  } else {
    console.log("⚠️  Limited error handling");
    warnings.push("Limited error handling in server.ts");
  }
}

console.log("");

// Test 6: Port availability
console.log("📋 Test 6: Port Availability");
console.log("-".repeat(70));

const net = require("net");
const port = process.env.PORT || 5000;

const server = net.createServer();

server.once("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`⚠️  Port ${port} is already in use`);
    warnings.push(
      `Port ${port} is in use - you may need to kill the existing process`
    );
  } else {
    console.log(`⚠️  Port check failed: ${err.message}`);
  }
  server.close();
  printSummary();
});

server.once("listening", () => {
  console.log(`✅ Port ${port} is available`);
  server.close();
  printSummary();
});

server.listen(port);

function printSummary() {
  console.log("");
  console.log("=".repeat(70));
  console.log("📊 HEALTH CHECK SUMMARY");
  console.log("=".repeat(70));
  console.log("");

  if (issues.length === 0 && warnings.length === 0) {
    console.log("✅ ALL CHECKS PASSED!");
    console.log("");
    console.log("Your backend is ready to start.");
    console.log("");
    console.log("To start the server, run:");
    console.log("  npm run dev");
    console.log("");
    process.exit(0);
  }

  if (issues.length > 0) {
    console.log("❌ CRITICAL ISSUES FOUND:");
    console.log("");
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    console.log("");
  }

  if (warnings.length > 0) {
    console.log("⚠️  WARNINGS:");
    console.log("");
    warnings.forEach((warning, i) => {
      console.log(`${i + 1}. ${warning}`);
    });
    console.log("");
  }

  console.log("=".repeat(70));
  console.log("");

  if (issues.length > 0) {
    console.log("💡 RECOMMENDED ACTIONS:");
    console.log("");

    if (issues.some((i) => i.includes("Dependencies"))) {
      console.log("1. Install dependencies:");
      console.log("   npm install");
      console.log("");
    }

    if (issues.some((i) => i.includes("environment variable"))) {
      console.log("2. Create/update .env file with required variables");
      console.log("   See .env.example for reference");
      console.log("");
    }

    if (issues.some((i) => i.includes("TypeScript"))) {
      console.log("3. Fix TypeScript errors shown above");
      console.log("");
    }

    process.exit(1);
  } else {
    console.log("⚠️  Server should start, but check warnings above");
    console.log("");
    process.exit(0);
  }
}
