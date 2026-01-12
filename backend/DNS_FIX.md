# ============================================

# QUICK FIX FOR DNS ISSUE

# ============================================

The error "querySrv ENOTFOUND" means your DNS cannot resolve MongoDB Atlas.

## 🚀 FASTEST SOLUTION: Use Local MongoDB

### Step 1: Install MongoDB Locally

**Option A: Automatic (Recommended)**

```cmd
# Run as Administrator
install-local-mongodb.bat
```

**Option B: Manual Download**

1. Go to: https://www.mongodb.com/try/download/community
2. Download MongoDB Community Edition
3. Install with default settings
4. MongoDB will run on localhost:27017

**Option C: Using Docker**

```cmd
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Update Your .env File

Replace your current MONGODB_URI with:

```env
MONGODB_URI=mongodb://localhost:27017/dashboard
```

**Complete .env should look like:**

```env
# MongoDB - Local
MONGODB_URI=mongodb://localhost:27017/dashboard

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Redis (optional - can be empty)
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

### Step 3: Start Your Server

```cmd
npm run dev
```

## ✅ DONE! No More DNS Errors!

---

## 🌐 ALTERNATIVE: Fix MongoDB Atlas Connection

If you MUST use MongoDB Atlas, try these:

### Fix 1: Change DNS Servers

1. Open Network Settings
2. Change DNS to Google DNS:
   - Primary: 8.8.8.8
   - Secondary: 8.8.4.4
3. Flush DNS: `ipconfig /flushdns`
4. Try again

### Fix 2: Disable VPN/Proxy

If using VPN, disable it and try again.

### Fix 3: Use Standard Connection String

Instead of SRV format, use standard format:

1. Go to MongoDB Atlas
2. Click "Connect" → "Drivers"
3. Choose "Standard connection string" (not SRV)
4. Copy and use that in .env

### Fix 4: Try Mobile Hotspot

Connect to phone's hotspot to bypass network restrictions.

---

## 💡 RECOMMENDED: Use Local MongoDB

**Why?**

- ✅ No internet required
- ✅ No DNS issues
- ✅ Faster performance
- ✅ No network restrictions
- ✅ Works offline

**Just run:**

```cmd
install-local-mongodb.bat
```

Then update .env and start server!
