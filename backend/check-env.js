require("dotenv").config();

console.log("Environment Variables Check:\n");
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI
    ? "SET (" + process.env.MONGODB_URI.substring(0, 30) + "...)"
    : "MISSING ❌"
);
console.log("REDIS_HOST:", process.env.REDIS_HOST || "MISSING ❌");
console.log("REDIS_PORT:", process.env.REDIS_PORT || "MISSING ❌");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET ✅" : "MISSING ❌");
console.log("PORT:", process.env.PORT || "MISSING ❌");
console.log("NODE_ENV:", process.env.NODE_ENV || "MISSING ❌");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "MISSING ❌");
