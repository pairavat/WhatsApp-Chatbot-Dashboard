require("dotenv").config();

console.log("=".repeat(60));
console.log("🔍 BACKEND STARTUP DIAGNOSTICS");
console.log("=".repeat(60));
console.log("");

// Step 1: Check Environment Variables
console.log("📋 Step 1: Checking Environment Variables...");
console.log("-".repeat(60));

const requiredEnvVars = [
  "MONGODB_URI",
  "REDIS_HOST",
  "REDIS_PORT",
  "JWT_SECRET",
  "PORT",
  "FRONTEND_URL",
];

let envIssues = [];

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    envIssues.push(varName);
  } else {
    // Hide sensitive values
    if (
      varName.includes("SECRET") ||
      varName.includes("PASSWORD") ||
      varName.includes("URI")
    ) {
      console.log(`✅ ${varName}: ****`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  }
});

console.log("");

if (envIssues.length > 0) {
  console.log(
    "⚠️  WARNING: Missing environment variables:",
    envIssues.join(", ")
  );
  console.log("");
}

// Step 2: Test MongoDB Connection
console.log("📋 Step 2: Testing MongoDB Connection...");
console.log("-".repeat(60));

const mongoose = require("mongoose");

async function testMongoDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log("❌ MONGODB_URI not set");
    return false;
  }

  // Show sanitized URI
  const safeUri = uri.replace(/:([^@]+)@/, ":****@");
  console.log("URI:", safeUri);

  try {
    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
    });

    console.log("✅ MongoDB connected successfully!");
    console.log("   Database:", mongoose.connection.name || "default");
    console.log("   Host:", mongoose.connection.host);

    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log("❌ MongoDB connection FAILED!");
    console.log("   Error:", error.message);

    if (
      error.message.includes("ETIMEOUT") ||
      error.message.includes("querySrv")
    ) {
      console.log("");
      console.log("💡 This is a NETWORK/DNS issue. Try:");
      console.log("   1. Check your internet connection");
      console.log("   2. Disable VPN");
      console.log("   3. Check firewall settings");
      console.log("   4. Try mobile hotspot");
    }

    if (error.message.includes("IP") || error.message.includes("whitelist")) {
      console.log("");
      console.log("💡 IP WHITELIST issue. Fix:");
      console.log("   1. Go to MongoDB Atlas → Network Access");
      console.log("   2. Add IP: 0.0.0.0/0 (allow all)");
    }

    return false;
  }
}

// Step 3: Test Redis Connection
async function testRedis() {
  console.log("");
  console.log("📋 Step 3: Testing Redis Connection...");
  console.log("-".repeat(60));

  const Redis = require("ioredis");

  const host = process.env.REDIS_HOST || "localhost";
  const port = process.env.REDIS_PORT || 6379;
  const password = process.env.REDIS_PASSWORD;

  console.log("Host:", host);
  console.log("Port:", port);
  console.log("Password:", password ? "****" : "none");

  try {
    console.log("⏳ Connecting to Redis...");

    const redis = new Redis({
      host,
      port: parseInt(port),
      password,
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    await redis.connect();
    await redis.ping();

    console.log("✅ Redis connected successfully!");

    await redis.quit();
    return true;
  } catch (error) {
    console.log("❌ Redis connection FAILED!");
    console.log("   Error:", error.message);
    console.log("");
    console.log("💡 Redis is not running. Options:");
    console.log("   1. Install Redis locally");
    console.log("   2. Use a cloud Redis service");
    console.log("   3. Comment out Redis in server.ts for now");

    return false;
  }
}

// Step 4: Check TypeScript compilation
async function checkTypeScript() {
  console.log("");
  console.log("📋 Step 4: Checking TypeScript...");
  console.log("-".repeat(60));

  const { execSync } = require("child_process");

  try {
    console.log("⏳ Running TypeScript compiler...");
    execSync("npx tsc --noEmit", { stdio: "pipe" });
    console.log("✅ TypeScript compilation successful!");
    return true;
  } catch (error) {
    console.log("❌ TypeScript compilation FAILED!");
    console.log("");
    console.log("Errors:");
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// Run all tests
async function runDiagnostics() {
  try {
    const mongoOk = await testMongoDB();
    const redisOk = await testRedis();
    const tsOk = await checkTypeScript();

    console.log("");
    console.log("=".repeat(60));
    console.log("📊 DIAGNOSTIC SUMMARY");
    console.log("=".repeat(60));
    console.log(
      "Environment Variables:",
      envIssues.length === 0 ? "✅ OK" : "❌ ISSUES"
    );
    console.log("MongoDB Connection:   ", mongoOk ? "✅ OK" : "❌ FAILED");
    console.log("Redis Connection:     ", redisOk ? "✅ OK" : "❌ FAILED");
    console.log("TypeScript:           ", tsOk ? "✅ OK" : "❌ FAILED");
    console.log("=".repeat(60));

    if (!mongoOk || !redisOk) {
      console.log("");
      console.log("⚠️  Server will NOT start until these issues are fixed!");
    } else {
      console.log("");
      console.log("✅ All checks passed! Server should start successfully.");
    }

    process.exit(mongoOk && redisOk ? 0 : 1);
  } catch (error) {
    console.error("");
    console.error("❌ Diagnostic failed:", error.message);
    process.exit(1);
  }
}

runDiagnostics();
