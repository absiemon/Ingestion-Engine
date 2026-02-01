# Zynatic - High-Scale Energy Ingestion Engine

## Project Overview

Zynatic is a robust, scalable backend system for ingesting, processing, and analyzing energy consumption data from meters and vehicles. Built with **NestJS**, **Prisma ORM**, and **PostgreSQL**, it provides real-time telemetry processing, asynchronous job queue management, and comprehensive analytics capabilities.

---

## 📊 Architecture Overview

### Core Components

```
┌─────────────────────────────────────────────────┐
│        API Gateway (NestJS Controllers)         │
├─────────────────────────────────────────────────┤
│  ├─ Ingest Module (Meters & Vehicles)          │
│  ├─ Analytics Module (Data Analysis)            │
│  └─ Telemetry Module (Real-time Processing)    │
├─────────────────────────────────────────────────┤
│  Bull Queue System (Redis)                      │
│  ├─ Ingest Queue                                │
│  ├─ Telemetry Queue                             │
│  └─ Analytics Queue                             │
├─────────────────────────────────────────────────┤
│  Prisma ORM + PostgreSQL Database               │
│  ├─ Meter Data                                  │
│  ├─ Vehicle Data                                │
│  ├─ Telemetry Records                           │
│  ├─ Analytics Aggregations                      │
│  └─ Queue Jobs                                  │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **Ingestion**: API receives meter/vehicle data
2. **Validation**: DTOs validate incoming payloads
3. **Storage**: Data persisted to PostgreSQL via Prisma
4. **Queueing**: Job enqueued for async processing
5. **Processing**: Workers consume queue jobs
6. **Enrichment**: Telemetry service enriches data
7. **Analytics**: Analytics service aggregates metrics

---

## 🗂️ Project Structure

```
src/
├── app.module.ts                 # Root module with all imports
├── main.ts                        # Application entry point
│
├── database/
│   └── prisma.service.ts         # Prisma ORM service
│
├── ingest/                        # Data ingestion module
│   ├── ingest.module.ts
│   ├── ingest.controller.ts      # REST endpoints for meters/vehicles
│   ├── ingest.service.ts         # Core ingestion logic
│   └── dto/
│       ├── meter.dto.ts
│       └── vehicle.dto.ts
│
├── queue/                         # Queue management
│   ├── queue.module.ts
│   └── queue.service.ts          # Bull queue operations
│
├── workers/
│   └── telemetry.worker.ts       # Telemetry job processor
│
├── telemetry/                     # Real-time data tracking
│   └── telemetry.service.ts
│
└── analytics/                     # Data analysis & insights
    ├── analytics.controller.ts   # Analytics endpoints
    └── analytics.service.ts
│
prisma/
├── schema.prisma                  # Database schema definition
└── migrations/                    # Database migrations (auto-generated)

.env                               # Environment variables
.env.example                       # Example env template
package.json                       # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- Redis (v6+)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

3. **Setup database**
   ```bash
   # Initialize Prisma
   npx prisma migrate dev --name init
   
   # Generate Prisma client
   npx prisma generate
   
   # View database with Prisma Studio
   npx prisma studio
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

   Server will run on `http://localhost:3000`

---

## 📡 API Endpoints

### Ingest API (`/api/ingest`)

#### Meters

```http
# Create single meter
POST /api/ingest/meters
Content-Type: application/json

{
  "meterId": "METER-001",
  "deviceId": "DEVICE-001",
  "voltage": 240,
  "current": 15.5,
  "power": 3720,
  "energy": 125.5,
  "location": "Building A - Floor 3"
}

# Bulk ingest meters
POST /api/ingest/meters/bulk
Content-Type: application/json

[
  { "meterId": "METER-002", ... },
  { "meterId": "METER-003", ... }
]

# Get all meters (paginated)
GET /api/ingest/meters?skip=0&take=10

# Get single meter
GET /api/ingest/meters/{id}

# Update meter
PUT /api/ingest/meters/{id}
Content-Type: application/json

{ "status": "inactive", "location": "New Location" }

# Delete meter
DELETE /api/ingest/meters/{id}
```

#### Vehicles

```http
# Create vehicle
POST /api/ingest/vehicles
Content-Type: application/json

{
  "vehicleId": "VEH-001",
  "regNumber": "ABC-1234",
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "type": "EV"
}

# Similar endpoints available:
# GET /api/ingest/vehicles
# GET /api/ingest/vehicles/{id}
# PUT /api/ingest/vehicles/{id}
# DELETE /api/ingest/vehicles/{id}
# POST /api/ingest/vehicles/bulk
```

### Analytics API (`/api/analytics`)

```http
# Get meter analytics
GET /api/analytics/meters/{meterId}

# Get consumption trends
GET /api/analytics/trends/{meterId}?days=30

# Compare multiple meters
GET /api/analytics/compare?meters=meter1,meter2,meter3

# Detect anomalies
GET /api/analytics/anomalies/{meterId}

# Get dashboard summary
GET /api/analytics/dashboard/summary
```

### Health Check

```http
GET /api/ingest/health
```

---

## 🔧 Key Features

### 1. **Data Ingestion**
- Single and bulk meter/vehicle ingestion
- Full CRUD operations
- Automatic job queueing for async processing
- Data validation via DTOs

### 2. **Asynchronous Processing**
- Bull queue with Redis backend
- Three dedicated queues: ingest, telemetry, analytics
- Automatic retry logic with exponential backoff
- Job monitoring and statistics

### 3. **Real-Time Telemetry**
- Continuous data streaming and recording
- Power quality calculations
- Unprocessed data tracking
- Bulk processing capabilities

### 4. **Analytics & Insights**
- Period-based aggregations (hourly, daily, monthly)
- Comparative analysis between meters
- Anomaly detection using statistical methods
- Dashboard summaries with key metrics
- Trend analysis with historical data

### 5. **Database Optimization**
- Indexed queries for fast lookups
- Automatic timestamps (createdAt, updatedAt)
- Cascading deletes for data integrity
- Flexible JSON storage for extensibility

---

## 💾 Database Schema

### Key Models

#### **Meter**
- Energy consumption device tracking
- Electrical measurements (voltage, current, power)
- Location and status information
- Timestamps for all readings

#### **Vehicle**
- Vehicle fleet management
- Type classification (EV, Hybrid, ICE)
- Registration and metadata
- Last seen tracking

#### **Telemetry**
- Flexible data recording system
- Supports both meters and vehicles
- JSON payload for extensibility
- Processing status tracking

#### **Analytics**
- Aggregated metrics storage
- Multiple time periods
- Power statistics (avg, max, min)
- Data point counts for validation

#### **QueueJob**
- Job tracking and monitoring
- Retry mechanism
- Status lifecycle: pending → processing → completed/failed
- Error logging

---

## 🎯 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zynatic

# Redis (for Bull Queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

### Queue Configuration

Each queue has custom settings:

| Queue | Attempts | Backoff | Strategy |
|-------|----------|---------|----------|
| Ingest | 3 | Exponential (2s) | Optimized for bulk data |
| Telemetry | 2 | Fixed (1s) | Real-time processing |
| Analytics | 3 | Exponential (5s) | Complex computations |

---

## 📝 Development Workflows

### Common Tasks

```bash
# Start development server with auto-reload
npm run start:dev

# Run production build
npm run build
npm run start

# View database schema visually
npx prisma studio

# Create new migration
npx prisma migrate dev --name <migration_name>

# Format code
npm run format

# Run linter
npm run lint

# Run tests
npm run test
npm run test:e2e
```

### Adding New Features

1. **Create DTOs** in `src/{module}/dto/`
2. **Extend Prisma schema** in `prisma/schema.prisma`
3. **Run migration**: `npx prisma migrate dev`
4. **Create service** with business logic
5. **Create controller** with endpoints
6. **Register in module** imports/providers

---

## 🔐 Security Considerations

- ✅ Input validation via class-validator
- ✅ Automatic SQL injection protection via Prisma
- ✅ Environment variable isolation
- ✅ CORS enabled for frontend integration
- ⚠️ TODO: JWT authentication
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Request logging/audit trails

---

## 🚨 Error Handling

- Custom exception classes (BadRequestException, NotFoundException)
- Validation errors with detailed messages
- Queue job failure tracking
- Graceful degradation with retries

---

## 📊 Monitoring & Debugging

### Queue Statistics
```typescript
// Get queue status
await queueService.getQueueStats('ingest');
// Returns: { waiting, active, completed, failed, delayed }

// Get specific job status
await queueService.getJobStatus('ingest', jobId);
```

### Database Inspection
```bash
# Access Prisma Studio
npx prisma studio
```

---

## 🧪 Testing Strategy

- Unit tests for services
- Integration tests for API endpoints
- E2E tests for complete workflows
- Queue job testing

---

## 🚀 Performance Optimization

- Database indexes on frequently queried columns
- Pagination for large datasets
- Asynchronous job processing
- Connection pooling (Prisma defaults)
- Queue job deduplication

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Submit pull request

---

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Bull Queue Docs](https://github.com/OptimalBits/bull)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

## 📄 License

ISC

---

## 🆘 Troubleshooting

### Redis Connection Failed
```bash
# Ensure Redis is running
redis-cli ping  # Should return PONG
```

### Database Connection Failed
```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -d zynatic
```

### Port Already in Use
```bash
# Change port in .env or use different port
PORT=3001 npm run start:dev
```

---

**Last Updated**: January 2026
**Status**: Production Ready ✅
