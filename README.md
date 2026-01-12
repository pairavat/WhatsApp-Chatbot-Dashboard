# Multi-Tenant WhatsApp Chatbot Platform

A scalable, configuration-driven WhatsApp chatbot platform for multiple companies, government bodies, and Zilla Parishads. Supports grievance redressal, appointment booking, service delivery, lead collection, surveys, and custom workflows.

## 🚀 Features

- **Multi-Tenant Architecture**: Complete data isolation per company
- **Configuration-Driven**: No hardcoded business logic, fully customizable
- **Role-Based Access Control (RBAC)**: SuperAdmin, CompanyAdmin, DepartmentAdmin, Operator, Viewer
- **Dynamic Dashboards**: Widgets load based on company type and user role
- **WhatsApp Integration**: Full WhatsApp Cloud API integration with media support
- **Bulk Import/Export**: Excel-based bulk data onboarding
- **Analytics Engine**: Real-time analytics with SLA tracking and geo-heatmaps
- **Audit Logging**: Complete audit trail of all actions
- **Soft Delete**: Recoverable deletions with SuperAdmin control

## 🏗️ Technology Stack

### Frontend

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- SWR for data fetching
- Recharts for visualizations

### Backend

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Redis (job queue & caching)
- Bull (background jobs)

### External Services

- WhatsApp Cloud API
- Cloudinary (image storage)
- SendGrid (email - future)
- Twilio (SMS - future)

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 6+
- Redis 6+
- WhatsApp Business Account with Cloud API access
- Cloudinary account

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Dashboard
```

### 2. Setup Backend

```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Setup Database

```bash
# Start MongoDB
mongod

# Start Redis
redis-server

# Run database migrations (if any)
cd backend
npm run migrate
```

### 5. Create SuperAdmin User

```bash
cd backend
npm run seed:superadmin
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- **Database**: MongoDB connection string
- **Redis**: Redis connection URL
- **JWT**: Secret keys for authentication
- **Cloudinary**: Cloud name, API key, and secret
- **WhatsApp**: Phone number ID, access token, verify token

### WhatsApp Webhook Setup

1. Go to Meta Developer Console
2. Configure webhook URL: `https://yourdomain.com/api/webhook/whatsapp`
3. Set verify token (same as `WHATSAPP_VERIFY_TOKEN` in .env)
4. Subscribe to message events

## 📁 Project Structure

```
Dashboard/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, RBAC, validation
│   │   ├── utils/           # Utilities
│   │   ├── jobs/            # Background jobs
│   │   └── server.ts        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities and API clients
│   │   └── styles/          # Global styles
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 👥 User Roles

### SuperAdmin

- Global access to all companies and departments
- Company lifecycle management
- System-wide configuration
- Data recovery and audit access

### Company Admin

- Manage own company settings
- Department management
- User management within company
- Chatbot configuration
- Company-wide analytics

### Department Admin

- Manage own department
- Officer management
- Department-specific analytics
- Case assignment

### Operator

- View assigned cases
- Update case status
- Communication with citizens

### Analytics Viewer

- Read-only access to analytics
- Export reports

## 🔐 Security

- JWT-based authentication
- RBAC enforced at API, database, and frontend levels
- Tenant isolation at database query level
- Input validation on all endpoints
- Audit logging for all actions
- Soft delete with recovery capability

## 📊 Company Types

- **GOV_GRIEVANCE**: Government grievance redressal
- **SERVICE_BOOKING**: Appointment and service booking
- **SURVEY_FEEDBACK**: Survey and feedback collection
- **LEAD_COLLECTION**: Lead capture and management
- **CUSTOM_ENTERPRISE**: Custom workflows

Each company type has specific:

- Chatbot flows
- Dashboard widgets
- Analytics metrics
- Enabled modules

## 📤 Import/Export

### Supported Entities

- Companies (SuperAdmin only)
- Departments
- Users/Officers
- Citizens
- Historical records (grievances, appointments)

### Import Process

1. Download Excel template
2. Fill in data
3. Upload file
4. Review validation errors
5. Confirm import
6. Monitor background job progress

### Export Process

- RBAC-scoped data export
- Multiple formats (Excel, CSV)
- Scheduled exports (future)

## 📈 Analytics

### Grievance Analytics

- Total grievances
- Department-wise distribution
- SLA compliance
- Status breakdown
- Geo-location heatmaps

### Appointment Analytics

- Booking trends
- Slot utilization
- Cancellation rates
- Department load

### Lead Analytics

- Conversion funnel
- Source performance
- Response time

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend integration tests
npm run test:integration

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Docker Deployment (Optional)

```bash
docker-compose up -d
```

### Environment Setup

- Configure production environment variables
- Setup SSL certificates
- Configure MongoDB indexes
- Setup backup strategy
- Configure monitoring and logging

## 📝 API Documentation

API documentation is available at `/api/docs` when running in development mode.

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Write tests
4. Submit pull request

## 📄 License

[Your License Here]

## 📞 Support

For support, email support@yourdomain.com or create an issue in the repository.

## 🗺️ Roadmap

- [ ] Email notifications
- [ ] SMS notifications
- [ ] WhatsApp outbound notifications
- [ ] Advanced analytics with AI insights
- [ ] Mobile app (React Native)
- [ ] Multi-language chatbot support
- [ ] Voice message support
- [ ] Payment integration
