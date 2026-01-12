const dns = require("dns");
const net = require("net");
const https = require("https");

console.log("=".repeat(70));
console.log("🔍 MONGODB ATLAS CONNECTION DIAGNOSTICS");
console.log("=".repeat(70));
console.log("");

// Test 1: Basic Internet Connectivity
console.log("📋 Test 1: Basic Internet Connectivity");
console.log("-".repeat(70));

https
  .get("https://www.google.com", (res) => {
    console.log("✅ Internet connection: OK");
    console.log(`   Status: ${res.statusCode}`);
    console.log("");
    runTest2();
  })
  .on("error", (err) => {
    console.log("❌ Internet connection: FAILED");
    console.log(`   Error: ${err.message}`);
    console.log("");
    console.log("💡 Fix: Check your internet connection");
    process.exit(1);
  });

// Test 2: DNS Resolution
function runTest2() {
  console.log("📋 Test 2: DNS Resolution for MongoDB Atlas");
  console.log("-".repeat(70));

  const hostname = "cluster0.wddazy8.mongodb.net";

  dns.resolve4(hostname, (err, addresses) => {
    if (err) {
      console.log("❌ DNS resolution: FAILED");
      console.log(`   Error: ${err.message}`);
      console.log("");
      console.log("💡 Possible fixes:");
      console.log("   1. Flush DNS cache: ipconfig /flushdns");
      console.log("   2. Change DNS to Google DNS (8.8.8.8, 8.8.4.4)");
      console.log("   3. Try: nslookup cluster0.wddazy8.mongodb.net");
      console.log("");
      runTest3();
    } else {
      console.log("✅ DNS resolution: OK");
      console.log(`   Hostname: ${hostname}`);
      console.log(`   IP Addresses: ${addresses.join(", ")}`);
      console.log("");
      runTest3();
    }
  });
}

// Test 3: MongoDB SRV Record
function runTest3() {
  console.log("📋 Test 3: MongoDB SRV Record Lookup");
  console.log("-".repeat(70));

  dns.resolveSrv(
    "_mongodb._tcp.cluster0.wddazy8.mongodb.net",
    (err, addresses) => {
      if (err) {
        console.log("❌ SRV record lookup: FAILED");
        console.log(`   Error: ${err.message}`);
        console.log("");
        console.log("💡 This is a DNS issue. Try:");
        console.log("   1. Use standard connection string instead of SRV");
        console.log("   2. Change DNS servers");
        console.log("   3. Disable VPN/Proxy");
        console.log("");
      } else {
        console.log("✅ SRV record lookup: OK");
        console.log(`   Found ${addresses.length} MongoDB servers`);
        addresses.forEach((addr, i) => {
          console.log(`   Server ${i + 1}: ${addr.name}:${addr.port}`);
        });
        console.log("");
      }
      runTest4();
    }
  );
}

// Test 4: TCP Connection to MongoDB
function runTest4() {
  console.log("📋 Test 4: TCP Connection to MongoDB Atlas");
  console.log("-".repeat(70));

  // Try to resolve and connect to the first available MongoDB server
  dns.resolveSrv(
    "_mongodb._tcp.cluster0.wddazy8.mongodb.net",
    (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        console.log("⚠️  Cannot test TCP connection (no SRV records found)");
        console.log("");
        runTest5();
        return;
      }

      const server = addresses[0];
      const socket = new net.Socket();

      socket.setTimeout(10000);

      socket.on("connect", () => {
        console.log("✅ TCP connection: OK");
        console.log(`   Connected to: ${server.name}:${server.port}`);
        console.log("");
        socket.destroy();
        runTest5();
      });

      socket.on("timeout", () => {
        console.log("❌ TCP connection: TIMEOUT");
        console.log(`   Could not connect to: ${server.name}:${server.port}`);
        console.log("");
        console.log("💡 This indicates a firewall/network block. Try:");
        console.log("   1. Disable VPN");
        console.log("   2. Try mobile hotspot");
        console.log("   3. Check firewall settings");
        console.log("   4. Contact network administrator");
        console.log("");
        socket.destroy();
        runTest5();
      });

      socket.on("error", (err) => {
        console.log("❌ TCP connection: FAILED");
        console.log(`   Error: ${err.message}`);
        console.log("");
        socket.destroy();
        runTest5();
      });

      console.log(
        `   Attempting connection to: ${server.name}:${server.port}...`
      );
      socket.connect(server.port, server.name);
    }
  );
}

// Test 5: Check MongoDB Atlas API
function runTest5() {
  console.log("📋 Test 5: MongoDB Atlas API Reachability");
  console.log("-".repeat(70));

  https
    .get("https://cloud.mongodb.com", (res) => {
      console.log("✅ MongoDB Atlas website: REACHABLE");
      console.log(`   Status: ${res.statusCode}`);
      console.log("");
      printSummary();
    })
    .on("error", (err) => {
      console.log("❌ MongoDB Atlas website: UNREACHABLE");
      console.log(`   Error: ${err.message}`);
      console.log("");
      console.log(
        "💡 This suggests network/firewall blocking MongoDB services"
      );
      console.log("");
      printSummary();
    });
}

// Print Summary and Recommendations
function printSummary() {
  console.log("=".repeat(70));
  console.log("📊 DIAGNOSTIC SUMMARY & RECOMMENDATIONS");
  console.log("=".repeat(70));
  console.log("");

  console.log("🔥 IMMEDIATE ACTIONS TO TRY:");
  console.log("");

  console.log("1️⃣  DISABLE VPN/PROXY");
  console.log("   If you're using a VPN, disable it and try again.");
  console.log("");

  console.log("2️⃣  TRY MOBILE HOTSPOT");
  console.log(
    "   Connect to your phone's hotspot to bypass network restrictions."
  );
  console.log("");

  console.log("3️⃣  FLUSH DNS CACHE");
  console.log("   Run: ipconfig /flushdns");
  console.log("");

  console.log("4️⃣  CHANGE DNS SERVERS");
  console.log("   Use Google DNS: 8.8.8.8 and 8.8.4.4");
  console.log("   Or Cloudflare DNS: 1.1.1.1 and 1.0.0.1");
  console.log("");

  console.log("5️⃣  CHECK MONGODB ATLAS IP WHITELIST");
  console.log("   • Go to: https://cloud.mongodb.com");
  console.log("   • Navigate to: Network Access → IP Access List");
  console.log("   • Add IP: 0.0.0.0/0 (allow all)");
  console.log("   • Wait 2-3 minutes for changes to apply");
  console.log("");

  console.log("6️⃣  CHECK WINDOWS FIREWALL");
  console.log("   • Open Windows Defender Firewall");
  console.log("   • Allow Node.js through firewall");
  console.log("   • Allow outbound connections on port 27017");
  console.log("");

  console.log("7️⃣  TRY STANDARD CONNECTION STRING");
  console.log("   Instead of: mongodb+srv://...");
  console.log("   Try: mongodb://...");
  console.log("   (Get from MongoDB Atlas → Connect → Drivers)");
  console.log("");

  console.log("8️⃣  CHECK ANTIVIRUS SOFTWARE");
  console.log("   Temporarily disable antivirus and test connection.");
  console.log("");

  console.log("=".repeat(70));
  console.log("");

  process.exit(0);
}
