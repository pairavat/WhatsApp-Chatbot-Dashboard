const mongoose = require("mongoose");
require("dotenv").config();

const testConnection = async () => {
  console.log("🔍 Testing MongoDB connection...\n");

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env file");
    process.exit(1);
  }

  // Hide password in logs
  const safeUri = uri.replace(/:([^@]+)@/, ":****@");
  console.log("📝 Connection URI:", safeUri);
  console.log("");

  try {
    console.log("⏳ Attempting to connect...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4, // Force IPv4
    });

    console.log("✅ SUCCESS! MongoDB connected successfully!");
    console.log("📊 Database:", mongoose.connection.name);
    console.log("🌐 Host:", mongoose.connection.host);

    await mongoose.connection.close();
    console.log("\n✅ Connection test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED!");
    console.error("\n📋 Error Details:");
    console.error("Type:", error.name);
    console.error("Message:", error.message);

    console.error("\n💡 Possible Solutions:");

    if (error.message.includes("IP") || error.message.includes("whitelist")) {
      console.error("1. Add your IP to MongoDB Atlas whitelist");
      console.error("   - Go to Network Access in MongoDB Atlas");
      console.error("   - Add IP: 0.0.0.0/0 (allow all) or your current IP");
    }

    if (
      error.message.includes("ETIMEOUT") ||
      error.message.includes("querySrv")
    ) {
      console.error("2. DNS/Network issue detected:");
      console.error("   - Check your internet connection");
      console.error("   - Disable VPN if active");
      console.error("   - Check firewall settings");
      console.error("   - Try using mobile hotspot");
    }

    if (error.message.includes("authentication")) {
      console.error("3. Check your MongoDB credentials");
      console.error("   - Verify username and password");
      console.error("   - Ensure special characters are URL-encoded");
    }

    console.error("\n4. Verify your MongoDB URI format:");
    console.error(
      "   mongodb+srv://username:password@cluster.mongodb.net/database-name"
    );

    process.exit(1);
  }
};

testConnection();
