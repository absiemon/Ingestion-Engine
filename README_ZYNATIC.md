# 🔋 Zynatic - High-Scale Energy Ingestion Engine

**A robust, scalable backend system for ingesting, processing, and analyzing energy consumption data from meters and vehicles.**

![NestJS](https://img.shields.io/badge/NestJS-v10-red?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v12+-green?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Queue-orange?logo=redis)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)

---

## 📋 Quick Links

- 🚀 **[Quick Start Guide](./QUICKSTART.md)** - Setup in 5 minutes
- 📚 **[Architecture Documentation](./BACKEND_SETUP.md)** - Deep dive into design
- 📡 **[API Reference](./API_REFERENCE.md)** - Complete endpoint documentation
- 🛠️ **[Scripts & Commands](./SCRIPTS.md)** - Useful development commands

---

## ✨ Features

### 🔌 Data Ingestion
- Single and bulk ingestion of meter and vehicle data
- Full CRUD operations on all entities
- Automatic queue-based processing
- Input validation with DTOs

### ⚡ Asynchronous Processing
- Bull queue system with Redis backend
- 3 dedicated queues: ingest, telemetry, analytics
- Automatic retry with exponential backoff
- Job monitoring and statistics

### 📊 Real-Time Telemetry
- Continuous data streaming
- Power quality calculations
- Flexible JSON payload storage
- Unprocessed data tracking

### 📈 Advanced Analytics
- Period-based aggregations (hourly, daily, monthly)
- Comparative analysis between devices
- Statistical anomaly detection
- Dashboard summaries and KPIs
- Trend analysis with historical data

### 🗄️ Database
- PostgreSQL with Prisma ORM
- Automatic migrations
- Optimized indexes
- Cascading deletes
- JSON field support

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│         REST API (NestJS)                │
│  ┌─────────┬─────────┬──────────────┐   │
│  │ Ingest  │ Telemetry│ Analytics   │   │
│  └────┬────┴────┬────┴──────┬───────┘   │
└───────┼─────────┼───────────┼───────────┘
        │         │           │
┌───────▼─────────▼───────────▼───────────┐
│      Queue System (Bull + Redis)        │
│  ┌─────────┬──────────┬──────────────┐  │
│  │ Ingest  │ Telemetry│ Analytics    │  │
│  └────┬────┴────┬─────┴──────┬───────┘  │
└───────┼─────────┼────────────┼──────────┘
        │         │            │
┌───────▼─────────▼────────────▼──────────┐
│   Workers & Services                    │
│  ┌────────────────────────────────────┐ │
│  │ Telemetry Processing               │ │
│  │ Data Enrichment                    │ │
│  │ Analytics Calculation              │ │
│  └────────────────────────────────────┘ │
└───────┬────────────────────────────────┘
        │
┌───────▼──────────────────────────────────┐
│  PostgreSQL Database (Prisma)            │
│  ┌──────────┬────────┬──────────┬──────┐ │
│  │ Meters   │Vehicles│ Telemetry│Data  │ │
│  └──────────┴────────┴──────────┴──────┘ │
└────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v12+
- Redis v6+

### Installation (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Initialize database
npx prisma migrate dev --name init

# 4. Start development server
npm run start:dev
```

Server runs at `http://localhost:3000` ✅

---

## 📡 API Usage Examples

### Create a Meter
```bash
curl -X POST http://localhost:3000/api/ingest/meters \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "METER-001",
    "deviceId": "DEVICE-001",
    "voltage": 240,
    "current": 15.5,
    "power": 3720,
    "energy": 125.5,
    "location": "Building A"
  }'
```

### Get Dashboard Summary
```bash
curl http://localhost:3000/api/analytics/dashboard/summary
```

### Analyze Meter Data
```bash
curl http://localhost:3000/api/analytics/meters/{meterId}
```

See [API_REFERENCE.md](./API_REFERENCE.md) for complete endpoint documentation.

---

## 📁 Project Structure

```
src/
├── main.ts                           # App entry point
├── app.module.ts                     # Root module
│
├── database/
│   └── prisma.service.ts            # ORM service
│
├── ingest/
│   ├── ingest.module.ts
│   ├── ingest.controller.ts         # REST endpoints
│   ├── ingest.service.ts            # Business logic
│   └── dto/                          # Data validation
│       ├── meter.dto.ts
│       └── vehicle.dto.ts
│
├── queue/
│   ├── queue.module.ts
│   └── queue.service.ts             # Queue operations
│
├── workers/
│   └── telemetry.worker.ts          # Job processor
│
├── telemetry/
│   ├── telemetry.module.ts
│   └── telemetry.service.ts
│
└── analytics/
    ├── analytics.module.ts
    ├── analytics.controller.ts      # Analytics endpoints
    └── analytics.service.ts

prisma/
├── schema.prisma                    # Database schema
└── migrations/                      # Auto-generated migrations

docs/
├── BACKEND_SETUP.md                 # Architecture guide
├── QUICKSTART.md                    # Setup instructions
├── API_REFERENCE.md                 # Endpoint docs
└── SCRIPTS.md                       # Development commands
```

---

## 🔧 Key Technologies

| Technology | Purpose |
|-----------|---------|
| **NestJS** | Backend framework with dependency injection |
| **Prisma** | Modern ORM with type-safety |
| **PostgreSQL** | Relational database |
| **Bull** | Job queue system |
| **Redis** | Queue backend & caching |
| **TypeScript** | Type-safe development |
| **Class Validator** | Input validation |

---

## 📊 Database Models

### Meter
```typescript
- meterId: unique identifier
- deviceId: device reference
- voltage, current, power, energy: electrical measurements
- location: deployment location
- status: active/inactive
- telemetry: related telemetry records
```

### Vehicle
```typescript
- vehicleId: unique identifier
- regNumber: registration number (unique)
- brand, model, year: vehicle details
- type: EV/Hybrid/ICE
- status: active/inactive
- telemetry: related telemetry records
```

### Telemetry
```typescript
- type: meter | vehicle
- meterId/vehicleId: entity reference
- data: flexible JSON payload
- timestamp: record time
- processed: processing status
```

### Analytics
```typescript
- meterId: meter reference
- period: hourly/daily/monthly
- avgPower, maxPower, minPower: statistics
- totalEnergy: aggregated consumption
- startTime, endTime: period boundaries
```

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for complete schema.

---

## 🎯 Development Workflow

### Start Development
```bash
npm run start:dev           # Hot-reload server
```

### Database Management
```bash
npx prisma studio         # Visual database explorer
npx prisma migrate dev    # Create new migration
```

### Code Quality
```bash
npm run lint              # Check code style
npm run format            # Auto-format code
npm test                  # Run tests
npm run test:e2e          # Integration tests
```

### Build & Deploy
```bash
npm run build             # Production build
npm run start             # Run built version
```

See [SCRIPTS.md](./SCRIPTS.md) for all available commands.

---

## 🔐 Security

✅ **Implemented:**
- Input validation via DTOs
- SQL injection protection (Prisma)
- Environment variable isolation
- CORS configuration
- Type-safe code

⚠️ **TODO:**
- JWT authentication
- Rate limiting
- Request logging
- API key management

---

## 📈 Performance Features

- **Pagination**: Limit data per request
- **Indexing**: Optimized database queries
- **Queueing**: Non-blocking operations
- **Async/Await**: Concurrent processing
- **JSON Fields**: Flexible data storage

---

## 🚨 Monitoring & Debugging

### Queue Status
```bash
# Via Redis CLI
redis-cli
KEYS queue:*
LLEN queue:ingest
```

### Database Inspection
```bash
npx prisma studio  # Visual explorer at http://localhost:5555
```

### Application Logs
```bash
# Set log level in .env
LOG_LEVEL=debug
```

---

## 📚 Documentation

- **[Setup Guide](./BACKEND_SETUP.md)** - Architecture, data flow, models
- **[Quick Start](./QUICKSTART.md)** - Installation and initial setup
- **[API Reference](./API_REFERENCE.md)** - All endpoints with examples
- **[Commands](./SCRIPTS.md)** - Development scripts
- **[Prisma Docs](https://www.prisma.io/docs)** - ORM documentation
- **[NestJS Docs](https://docs.nestjs.com)** - Framework guide

---

## 🆘 Troubleshooting

### PostgreSQL Connection Failed
```bash
# Ensure PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check DATABASE_URL in .env
```

### Redis Connection Failed
```bash
# Ensure Redis is running
redis-cli ping  # Should return PONG
```

### Port Already in Use
```bash
# Use different port
PORT=3001 npm run start:dev
```

See [QUICKSTART.md](./QUICKSTART.md) for more troubleshooting tips.

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push branch: `git push origin feature/name`
4. Create pull request

---

## 📄 License

ISC - See LICENSE file for details

---

## 📞 Support

- 📖 Read documentation in `/docs`
- 🐛 Check troubleshooting section
- 📧 Review code comments
- 🔍 Inspect logs in terminal

---

**Built with ❤️ using NestJS, Prisma & PostgreSQL**

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Last Updated:** Jan 31, 2026
