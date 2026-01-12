# Multi-Tenant WhatsApp Chatbot Platform - Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Redis** (v6 or higher) - [Download](https://redis.io/download)
- **Git** - [Download](https://git-scm.com/)

## Step 1: Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Step 2: Setup Environment Variables

Create a `.env` file in the root directory by copying from `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Backend
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/whatsapp_chatbot_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary (Sign up at https://cloudinary.com/)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WhatsApp Cloud API (Get from Meta Developer Console)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 3: Start MongoDB

### Windows

```bash
# Start MongoDB service
net start MongoDB

# Or run mongod directly
mongod --dbpath C:\data\db
```

### macOS/Linux

```bash
# Start MongoDB service
sudo systemctl start mongod

# Or run mongod directly
mongod --dbpath /data/db
```

## Step 4: Start Redis

### Windows

```bash
# Start Redis server
redis-server
```

### macOS/Linux

```bash
# Start Redis service
sudo systemctl start redis

# Or run redis-server directly
redis-server
```

## Step 5: Create SuperAdmin User

```bash
cd backend
npm run seed:superadmin
```

This will create a SuperAdmin user with:

- **Email**: admin@platform.com
- **Password**: 111111

⚠️ **IMPORTANT**: Change this password after first login!

## Step 6: Start the Backend

```bash
cd backend
npm run dev
```

The backend should now be running on `http://localhost:5000`

## Step 7: Start the Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend should now be running on `http://localhost:3000`

## Step 8: Verify Installation

1. Open your browser and go to `http://localhost:3000`
2. You should see the home page with login options
3. Click "SuperAdmin Login"
4. Login with:
   - Email: `admin@platform.com`
   - Password: `111111`

## Troubleshooting

### MongoDB Connection Error

If you see "Failed to connect to MongoDB":

- Ensure MongoDB is running
- Check the `MONGODB_URI` in your `.env` file
- Verify MongoDB is accessible at the specified URI

### Redis Connection Error

If you see "Failed to connect to Redis":

- Ensure Redis is running
- Check the `REDIS_URL` in your `.env` file
- Try `redis-cli ping` to test Redis connection

### Port Already in Use

If port 5000 or 3000 is already in use:

- Change the `PORT` in `.env` for backend
- Change the port in `frontend/package.json` dev script for frontend

### Module Not Found Errors

If you see module not found errors:

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Next Steps

After successful installation:

1. **Create a Company**: Use the SuperAdmin panel to create your first company
2. **Setup Departments**: Add departments to your company
3. **Create Users**: Add users with different roles
4. **Configure WhatsApp**: Setup WhatsApp Cloud API credentials
5. **Test the System**: Create test grievances and appointments

## Development Commands

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secrets
3. Setup SSL certificates
4. Configure MongoDB with authentication
5. Setup Redis with password
6. Use environment-specific Cloudinary and WhatsApp credentials
7. Enable CORS only for your production domain

Refer to the main [README.md](file:///c:/Users/anand/OneDrive/Desktop/Dashboard/README.md) for more details.
