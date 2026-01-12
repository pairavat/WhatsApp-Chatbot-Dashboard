# Network Connection Issues - Troubleshooting Guide

## Current Issues

You're experiencing **NETWORK TIMEOUT** errors with both MongoDB Atlas and Redis Labs:

1. **MongoDB**: `querySrv ETIMEOUT _mongodb._tcp.cluster0.wddazy8.mongodb.net`
2. **Redis**: `connect ETIMEDOUT` to `redis-16039.c274.us-east-1-3.ec2.cloud.redislabs.com:16039`

These are **NOT code errors** - they are network connectivity issues.

---

## What I've Fixed in the Code

✅ **Enhanced MongoDB Connection** (`database.ts`):

- Added retry logic (3 attempts with 5-second delays)
- Reduced timeouts from 30s to 15s for faster failure detection
- Added comprehensive error diagnostics
- Better logging with sanitized URIs

✅ **Enhanced Redis Connection** (`redis.ts`):

- Fixed unhandled error events (prevents crashes)
- Added `lazyConnect` and `enableOfflineQueue: false` for fail-fast behavior
- Reduced timeouts from 10s to 8s
- Better error handling and cleanup
- Comprehensive diagnostics for different error types

✅ **Updated Server Shutdown** (`server.ts`):

- Added proper Redis disconnection on shutdown
- Both SIGTERM and SIGINT now close MongoDB and Redis gracefully

---

## Root Cause Analysis

### MongoDB Timeout

The error `querySrv ETIMEOUT` means:

- Your computer cannot reach MongoDB Atlas servers
- DNS resolution is timing out
- Network/firewall is blocking the connection

### Redis Timeout

The error `connect ETIMEDOUT` means:

- Your computer cannot reach Redis Labs servers
- Network/firewall is blocking port 16039
- The Redis cloud instance may be unreachable

---

## Solutions (Try in Order)

### 🔥 **Immediate Fix: Check Your Network**

1. **Test Your Internet Connection**

   ```cmd
   ping google.com
   ```

   If this fails, your internet is down.

2. **Test MongoDB Atlas Connectivity**

   ```cmd
   nslookup cluster0.wddazy8.mongodb.net
   ```

   If this fails, DNS cannot resolve MongoDB Atlas.

3. **Test Redis Connectivity**
   ```cmd
   ping redis-16039.c274.us-east-1-3.ec2.cloud.redislabs.com
   ```

### 🛡️ **VPN/Firewall Issues**

**If you're using a VPN:**

- Disable it temporarily and try again
- Some VPNs block database connections

**If you have a firewall:**

- Allow outbound connections to:
  - MongoDB Atlas: Port 27017
  - Redis Labs: Port 16039

**Windows Firewall:**

```cmd
# Run as Administrator
netsh advfirewall firewall add rule name="MongoDB Atlas" dir=out action=allow protocol=TCP remoteport=27017
netsh advfirewall firewall add rule name="Redis Labs" dir=out action=allow protocol=TCP remoteport=16039
```

### 🌐 **Try a Different Network**

1. **Mobile Hotspot**: Connect to your phone's hotspot
2. **Different WiFi**: Try a different network
3. **Ethernet**: Use wired connection if possible

This will help determine if it's a network-specific issue.

### ☁️ **MongoDB Atlas Configuration**

1. **Check IP Whitelist**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Navigate to: **Network Access** → **IP Access List**
   - Add IP: `0.0.0.0/0` (allow all IPs)
   - Wait 2-3 minutes for changes to propagate

2. **Verify Cluster Status**:
   - Go to **Database** → **Clusters**
   - Check if cluster is running (green status)
   - If paused, click "Resume"

3. **Check Database User**:
   - Go to **Database Access**
   - Verify user exists with correct password
   - Ensure user has "Read and write to any database" permission

### 🔴 **Redis Labs Configuration**

1. **Check Redis Instance Status**:
   - Log in to [Redis Labs](https://app.redislabs.com/)
   - Verify instance is active
   - Check if it's in the same region (US-East-1)

2. **Verify Connection Details**:
   - Confirm host: `redis-16039.c274.us-east-1-3.ec2.cloud.redislabs.com`
   - Confirm port: `16039`
   - Verify password is correct

3. **Check IP Whitelist** (if enabled):
   - Add `0.0.0.0/0` to allow all IPs

### 🔧 **DNS Issues**

If DNS resolution is failing:

1. **Change DNS Servers**:
   - Use Google DNS: `8.8.8.8` and `8.8.4.4`
   - Use Cloudflare DNS: `1.1.1.1` and `1.0.0.1`

2. **Flush DNS Cache**:
   ```cmd
   ipconfig /flushdns
   ```

### 🚀 **Run Without Redis (Temporary)**

If you want to get the server running while troubleshooting:

1. **Remove Redis Environment Variables** from `.env`:

   ```env
   # Comment out or remove these:
   # REDIS_HOST=redis-16039.c274.us-east-1-3.ec2.cloud.redislabs.com
   # REDIS_PORT=16039
   # REDIS_PASSWORD=your_password
   ```

2. The server will start without Redis (caching disabled)

---

## Testing Your Fixes

Run the diagnostic script:

```cmd
cd c:\Users\anand\OneDrive\Desktop\Dashboard\backend
node debug-startup.js
```

This will test:

- ✅ Environment variables
- ✅ MongoDB connection
- ✅ Redis connection
- ✅ TypeScript compilation

---

## Expected Behavior After Fixes

### ✅ **Successful Connection**

```
🔄 MongoDB connection attempt 1/3
   URI: mongodb+srv:****@cluster0.wddazy8.mongodb.net/dashboard
✅ MongoDB connected successfully!
   Database: dashboard

🔄 Attempting to connect to Redis at redis-16039...
✅ Redis connection established
✅ Redis is ready
✅ Redis connected and responding
```

### ⚠️ **Partial Success (MongoDB only)**

```
✅ MongoDB connected successfully!
⚠️  Redis connection failed: Connection timeout
⚠️  Server will continue without Redis (caching disabled)
```

This is acceptable - the server will run without caching.

---

## Still Not Working?

### Check These:

1. **Are you in India?**
   - Some ISPs block cloud database connections
   - Try mobile hotspot or different ISP

2. **Corporate/School Network?**
   - These often block database ports
   - Use personal network or VPN

3. **Antivirus Software?**
   - Temporarily disable and test
   - Some antivirus blocks database connections

4. **MongoDB Atlas Free Tier Limits?**
   - Check if you've exceeded free tier limits
   - Verify cluster hasn't been paused

5. **Redis Labs Free Tier?**
   - Check if instance is still active
   - Verify you haven't exceeded limits

---

## Alternative: Use Local Databases

### Option 1: Local MongoDB

```cmd
# Install MongoDB Community Edition
# Then update .env:
MONGODB_URI=mongodb://localhost:27017/dashboard
```

### Option 2: Skip Redis Entirely

```env
# Just remove or comment out Redis vars
# REDIS_HOST=
# REDIS_PORT=
# REDIS_PASSWORD=
```

The server will work fine without Redis - you'll just lose caching functionality.

---

## Contact Support

If none of these work:

**MongoDB Atlas Support:**

- Check [Status Page](https://status.cloud.mongodb.com/)
- Contact support if there's an outage

**Redis Labs Support:**

- Check [Status Page](https://status.redislabs.com/)
- Verify your instance is active

---

## Summary

**The code is now fixed** with:

- ✅ Better error handling
- ✅ Retry logic
- ✅ Comprehensive diagnostics
- ✅ Graceful failure (server can start without Redis)

**The issue is NETWORK-related**, not code-related. Follow the solutions above to resolve connectivity issues.
