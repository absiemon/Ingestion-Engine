# API Endpoints Reference

Complete list of all available API endpoints with examples.

## Base URL
```
http://localhost:3000/api
```

---

## 🏥 Health Check

### GET `/ingest/health`
Check if server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T10:30:00.000Z"
}
```

---

## 📊 Ingest Endpoints

### METERS

#### POST `/ingest/meters`
Create a new meter.

**Request:**
```json
{
  "meterId": "METER-001",
  "deviceId": "DEVICE-001",
  "voltage": 240,
  "current": 15.5,
  "power": 3720,
  "energy": 125.5,
  "location": "Building A - Floor 3",
  "timestamp": "2026-01-31T10:00:00Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "meter": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1k2l",
    "meterId": "METER-001",
    "deviceId": "DEVICE-001",
    "voltage": 240,
    "current": 15.5,
    "power": 3720,
    "energy": 125.5,
    "location": "Building A - Floor 3",
    "status": "active",
    "timestamp": "2026-01-31T10:00:00Z",
    "createdAt": "2026-01-31T10:30:00Z",
    "updatedAt": "2026-01-31T10:30:00Z"
  },
  "message": "Meter created and queued for processing"
}
```

#### POST `/ingest/meters/bulk`
Bulk ingest multiple meters.

**Request:**
```json
[
  {
    "meterId": "METER-002",
    "deviceId": "DEVICE-002",
    "voltage": 240,
    "current": 12.3,
    "power": 2952,
    "energy": 98.4,
    "location": "Building A - Floor 4"
  },
  {
    "meterId": "METER-003",
    "deviceId": "DEVICE-003",
    "voltage": 240,
    "current": 18.7,
    "power": 4488,
    "energy": 156.2,
    "location": "Building B - Floor 1"
  }
]
```

**Response:** `201 Created`
```json
{
  "successful": 2,
  "failed": 0,
  "errors": []
}
```

#### GET `/ingest/meters`
Get all meters with pagination.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `take` (optional): Number of records to return (default: 10, max: 100)

**Example:** `GET /ingest/meters?skip=0&take=20`

**Response:**
```json
{
  "data": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j1k2l",
      "meterId": "METER-001",
      "deviceId": "DEVICE-001",
      "voltage": 240,
      "current": 15.5,
      "power": 3720,
      "energy": 125.5,
      "location": "Building A - Floor 3",
      "status": "active",
      "timestamp": "2026-01-31T10:00:00Z",
      "createdAt": "2026-01-31T10:30:00Z",
      "updatedAt": "2026-01-31T10:30:00Z"
    }
  ],
  "pagination": {
    "skip": 0,
    "take": 20,
    "total": 42
  }
}
```

#### GET `/ingest/meters/{id}`
Get a specific meter by ID.

**Response:**
```json
{
  "id": "clx1a2b3c4d5e6f7g8h9i0j1k2l",
  "meterId": "METER-001",
  "deviceId": "DEVICE-001",
  "voltage": 240,
  "current": 15.5,
  "power": 3720,
  "energy": 125.5,
  "location": "Building A - Floor 3",
  "status": "active",
  "timestamp": "2026-01-31T10:00:00Z",
  "telemetry": [
    {
      "id": "telem-001",
      "type": "meter",
      "data": { "voltage": 240, "current": 15.5, "power": 3720, "quality": {...} },
      "timestamp": "2026-01-31T10:00:00Z",
      "processed": true
    }
  ],
  "createdAt": "2026-01-31T10:30:00Z",
  "updatedAt": "2026-01-31T10:30:00Z"
}
```

#### PUT `/ingest/meters/{id}`
Update a meter.

**Request:**
```json
{
  "status": "inactive",
  "location": "Building C - Floor 2",
  "voltage": 240.5,
  "current": 16.0
}
```

**Response:** `200 OK`
```json
{
  "id": "clx1a2b3c4d5e6f7g8h9i0j1k2l",
  "meterId": "METER-001",
  "deviceId": "DEVICE-001",
  "voltage": 240.5,
  "current": 16.0,
  "power": 3720,
  "energy": 125.5,
  "location": "Building C - Floor 2",
  "status": "inactive",
  "timestamp": "2026-01-31T10:00:00Z",
  "createdAt": "2026-01-31T10:30:00Z",
  "updatedAt": "2026-01-31T10:35:00Z"
}
```

#### DELETE `/ingest/meters/{id}`
Delete a meter.

**Response:** `204 No Content`

---

### VEHICLES

#### POST `/ingest/vehicles`
Create a new vehicle.

**Request:**
```json
{
  "vehicleId": "VEH-001",
  "regNumber": "ABC-1234",
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "type": "EV"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "vehicle": {
    "id": "clx2a2b3c4d5e6f7g8h9i0j1k2l",
    "vehicleId": "VEH-001",
    "regNumber": "ABC-1234",
    "brand": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "type": "EV",
    "status": "active",
    "lastSeen": "2026-01-31T10:30:00Z",
    "createdAt": "2026-01-31T10:30:00Z",
    "updatedAt": "2026-01-31T10:30:00Z"
  },
  "message": "Vehicle created and queued for processing"
}
```

#### POST `/ingest/vehicles/bulk`
Bulk ingest vehicles.

**Request:**
```json
[
  {
    "vehicleId": "VEH-002",
    "regNumber": "XYZ-5678",
    "brand": "BMW",
    "model": "i3",
    "year": 2022,
    "type": "EV"
  }
]
```

#### GET `/ingest/vehicles`
Get all vehicles with pagination.

**Example:** `GET /ingest/vehicles?skip=0&take=10`

#### GET `/ingest/vehicles/{id}`
Get specific vehicle.

#### PUT `/ingest/vehicles/{id}`
Update a vehicle.

**Request:**
```json
{
  "status": "inactive",
  "brand": "Tesla"
}
```

#### DELETE `/ingest/vehicles/{id}`
Delete a vehicle.

---

## 📈 Analytics Endpoints

### GET `/analytics/meters/{meterId}`
Get analytics for a specific meter.

**Response:**
```json
{
  "meterId": "clx1a2b3c4d5e6f7g8h9i0j1k2l",
  "data": [
    {
      "id": "analytic-001",
      "meterId": "clx1a2b3c4d5e6f7g8h9i0j1k2l",
      "period": "daily",
      "avgPower": 3850.5,
      "maxPower": 4500,
      "minPower": 3200,
      "totalEnergy": 92.4,
      "dataPoints": 24,
      "startTime": "2026-01-30T00:00:00Z",
      "endTime": "2026-01-31T00:00:00Z",
      "createdAt": "2026-01-31T10:30:00Z",
      "updatedAt": "2026-01-31T10:30:00Z"
    }
  ],
  "summary": {
    "avgPower": 3850.5,
    "maxPower": 4500,
    "totalEnergy": 92.4
  }
}
```

### GET `/analytics/trends/{meterId}`
Get consumption trends over time.

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30)

**Example:** `GET /analytics/trends/{meterId}?days=7`

**Response:**
```json
{
  "meterId": "clx1a2b3c4d5e6f7g8h9i0j1k2l",
  "period": "Last 7 days",
  "dataPoints": 168,
  "data": [
    {
      "timestamp": "2026-01-24T00:00:00Z",
      "power": 3720,
      "energy": 89.3
    },
    {
      "timestamp": "2026-01-25T00:00:00Z",
      "power": 3950,
      "energy": 94.8
    }
  ]
}
```

### GET `/analytics/compare`
Compare multiple meters.

**Query Parameters:**
- `meters` (required): Comma-separated meter IDs

**Example:** `GET /analytics/compare?meters=meter1,meter2,meter3`

**Response:**
```json
{
  "comparison": [
    {
      "meterId": "meter1",
      "power": 3720,
      "energy": 125.5
    },
    {
      "meterId": "meter2",
      "power": 2950,
      "energy": 98.4
    }
  ],
  "avgPower": 3335,
  "totalEnergy": 223.9
}
```

### GET `/analytics/anomalies/{meterId}`
Detect anomalies using statistical analysis.

**Response:**
```json
{
  "meterId": "clx1a2b3c4d5e6f7g8h9i0j1k2l",
  "avgPower": 3850.5,
  "stdDev": 450.2,
  "anomalies": [
    {
      "timestamp": "2026-01-31T08:15:00Z",
      "power": 5200,
      "deviation": 34.95
    },
    {
      "timestamp": "2026-01-31T02:30:00Z",
      "power": 2100,
      "deviation": -45.5
    }
  ]
}
```

### GET `/analytics/dashboard/summary`
Get overall dashboard summary.

**Response:**
```json
{
  "meters": 42,
  "vehicles": 15,
  "totalEnergy": 5234.8,
  "avgPower": 3895.3,
  "timestamp": "2026-01-31T10:30:00Z"
}
```

---

## 🔍 Error Responses

All endpoints return proper HTTP status codes:

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Created | Successfully created resource |
| 204 | No Content | Successfully deleted resource |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Unexpected error |

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "error": "Bad Request"
}
```

---

## 📋 Pagination

List endpoints support pagination:

```
GET /ingest/meters?skip=0&take=20
```

**Response includes pagination info:**
```json
{
  "data": [...],
  "pagination": {
    "skip": 0,
    "take": 20,
    "total": 42
  }
}
```

---

## 🧪 Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/ingest/health

# Get all meters
curl http://localhost:3000/api/ingest/meters

# Create meter
curl -X POST http://localhost:3000/api/ingest/meters \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "TEST-001",
    "deviceId": "DEVICE-001",
    "voltage": 240,
    "current": 15.5,
    "power": 3720,
    "energy": 125.5
  }'

# Get dashboard
curl http://localhost:3000/api/analytics/dashboard/summary
```

---

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for architecture overview.
See [QUICKSTART.md](./QUICKSTART.md) for setup instructions.
