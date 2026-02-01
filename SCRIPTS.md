# Development Scripts & Commands

All the npm scripts you need to work with the Zynatic backend.

## Running the Application

```bash
# Development (with auto-reload)
npm run start:dev

# Production build & run
npm run build
npm run start

# Debug mode
npm run start:debug
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Testing

```bash
# Run unit & integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

## Database

```bash
# View database visually
npx prisma studio

# Run migrations (after schema changes)
npx prisma migrate dev --name <migration_name>

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database with initial data
npx prisma db seed
```

## Project Generation

```bash
# Generate new module
nest generate module <module_name>

# Generate new controller
nest generate controller <module_name>

# Generate new service
nest generate service <module_name>
```

## Queue Management

```bash
# Monitor queue jobs (redis)
redis-cli

# Inside redis-cli:
KEYS *    # See all keys
LLEN queue:ingest    # Get queue length
```

## Useful One-Liners

```bash
# Fresh start (clean install)
rm -rf node_modules package-lock.json && npm install

# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check what's installed
npm list --depth=0
```

## Environment Setup

```bash
# Create env file from template
cp .env.example .env

# Validate env variables
npx ts-node -e "require('dotenv').config(); console.log(process.env)"
```

---

See [QUICKSTART.md](./QUICKSTART.md) for setup guide.
See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for architecture documentation.
