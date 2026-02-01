# Quick Start Guide - Zynatic Backend

## 1️⃣ Prerequisites

Ensure you have installed:
- **Node.js** v18+ → [Download](https://nodejs.org/)
- **PostgreSQL** v12+ → [Download](https://www.postgresql.org/download/)
- **Redis** v6+ → [Download](https://redis.io/download)

## 2️⃣ Initial Setup (First Time Only)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your credentials
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

**Required variables:**
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/zynatic
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
PORT=3000
```

### Step 3: Setup PostgreSQL Database
```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE zynatic;

# Exit
\q
```

### Step 4: Initialize Prisma
```bash
# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) View database visually
npx prisma studio
```

### Step 5: Start Redis
```bash
# Windows (if installed via WSL or Docker)
redis-server

# Or start Redis service if installed as a service
# Check Services panel in Windows
```

## 3️⃣ Running the Application

### Development Mode (with auto-reload)
```bash
npm run start:dev
```

Expected output:
```
[Nest] 1234  - 01/31/2026, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1234  - 01/31/2026, 10:30:01 AM     LOG [InstanceLoader] AppModule dependencies initialized
🚀 Server is running on http://localhost:3000
```

### Production Mode
```bash
npm run build
npm run start
```

## 4️⃣ Testing the API

### Health Check
```bash
curl http://localhost:3000/api/ingest/health
```

### Create a Meter
```bash
curl -X POST http://localhost:3000/api/ingest/meters \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "METER-TEST-001",
    "deviceId": "DEVICE-001",
    "voltage": 240,
    "current": 15.5,
    "power": 3720,
    "energy": 125.5,
    "location": "Test Location"
  }'
```

### Get All Meters
```bash
curl http://localhost:3000/api/ingest/meters
```

### Get Dashboard Summary
```bash
curl http://localhost:3000/api/analytics/dashboard/summary
```

## 5️⃣ Database Management

### View Database (Visual UI)
```bash
npx prisma studio
```
Opens at `http://localhost:5555`

### Check Database Status
```bash
# Connect to PostgreSQL
psql -U postgres -d zynatic

# List tables
\dt

# View records
SELECT * FROM "Meter" LIMIT 10;

# Exit
\q
```

### Create a Migration (After Schema Changes)
```bash
# After editing prisma/schema.prisma
npx prisma migrate dev --name describe_your_change
```

## 6️⃣ Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run built app |
| `npm run lint` | Check code style |
| `npm run format` | Auto-format code |
| `npm test` | Run tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma db push` | Sync schema to database |
| `npx prisma db seed` | Run seed script (if configured) |

## 7️⃣ Troubleshooting

### ❌ "Cannot find module '@nestjs/core'"
```bash
npm install
```

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL is not running
- Check: `psql -U postgres` (should not error)
- Start PostgreSQL service

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:6379"
- Redis is not running
- Start Redis: `redis-server`
- Or start Redis service in Services (Windows)

### ❌ "Port 3000 already in use"
```bash
# Use different port
PORT=3001 npm run start:dev

# Or kill process using port 3000
# Windows: taskkill /PID <process_id> /F
# Linux/Mac: kill -9 <process_id>
```

### ❌ "Database 'zynatic' does not exist"
```bash
psql -U postgres
CREATE DATABASE zynatic;
\q
npx prisma migrate dev --name init
```

### ❌ Prisma Client not generated
```bash
npx prisma generate
```

## 8️⃣ Useful Tools

- **API Testing**: [Postman](https://postman.com) or [Insomnia](https://insomnia.rest)
- **Database Viewer**: `npx prisma studio` (built-in)
- **Redis Monitor**: `redis-cli`
- **Queue Monitor**: Bull Dash (can be added later)

## 9️⃣ Next Steps

1. ✅ Setup complete! Application is running
2. 📚 Read [BACKEND_SETUP.md](./BACKEND_SETUP.md) for architecture details
3. 📝 Explore API in [swagger/openapi docs](./docs/) (will add)
4. 🧪 Write tests for your features
5. 🔐 Add authentication (JWT) - see [Security](./BACKEND_SETUP.md#-security-considerations)

## 🆘 Need Help?

- Check logs in terminal
- View database with `npx prisma studio`
- Test Redis: `redis-cli ping`
- Check API responses with curl or Postman
- Review [BACKEND_SETUP.md](./BACKEND_SETUP.md)

---

**Happy Coding! 🚀**
