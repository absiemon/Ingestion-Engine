# Telemetry Analytics Platform – System Architecture & Design

## Overview

This project is a **high-throughput telemetry ingestion and analytics system** designed for **vehicles and meters**.  
It supports **real-time status**, **historical telemetry**, and **time-bucketed analytics** (hourly/daily) while remaining **scalable, fault-tolerant, and cost-efficient**.

The system is built using:

- **NestJS** – application framework
- **PostgreSQL** – primary data store
- **Prisma ORM** – schema & data access
- **Redis + Bull** – async queues
- **Worker-based aggregation pipeline**

---

<img width="1805" height="631" alt="image" src="https://github.com/user-attachments/assets/6259ae4d-9f15-4229-9644-28971dc40188" />




## High-Level Architecture

             ┌────────────┐
             │   Devices  │
             │(Meter / EV)│
             └─────┬──────┘
                   │
                   ▼
           ┌─────────────────┐
           │  Ingest API      │
           │  (HTTP / MQTT)   │
           └─────┬───────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌──────────────────┐ ┌─────────────────────┐
│ Telemetry Queue  │ │ Analytics Queue     │
│ (raw ingestion)  │ │ (aggregation jobs)  │
└─────┬────────────┘ └──────────┬──────────┘
      │                         │
      ▼                         ▼
┌──────────────┐ ┌─────────────────────┐
│ Telemetry    │ │ Aggregation Worker  │
│ Worker       │ │    (hourly / daily) │
└─────┬────────┘ └──────────┬──────────┘
      │                     │
      ▼                     ▼
┌──────────────────┐ ┌────────────────────┐
│ HOT TABLES       │ │ COLD / AGG TABLES  │
│ (Live + History) │ │ (Hourly / Daily)   │
└──────────────────┘ └────────────────────┘



---

## Data Modeling Strategy

### 1. Hot Tables (Write-Optimized)

These tables receive **high-frequency writes**.

#### Live Status (latest state)
- `VehicleLiveStatus`
- `MeterLiveStatus`

Used for:
- Dashboards
- Current SOC / Voltage
- Real-time monitoring

> Only **1 row per entity**, constantly overwritten.

#### Telemetry History (raw events)
- `VehicleTelemetryHistory`
- `MeterTelemetryHistory`

Used for:
- Backfills
- Reprocessing
- Accurate historical calculations

Characteristics:
- Append-only
- High write throughput
- Indexed by `(entityId, timestamp)`

---

### 2. Cold Tables (Read-Optimized)

These tables store **aggregated analytics**.

#### Hourly Aggregates
- `VehicleEnergyHourly`
- `MeterEnergyHourly`

#### Daily Aggregates
- `MeterEnergyDaily`

Used for:
- Analytics APIs
- Trends
- Dashboards
- Comparisons

Characteristics:
- Very small row count
- Fast queries
- Predictable access patterns

---

## Why Hot + Cold Tables?

| Problem | Solution |
|------|--------|
| Millions of telemetry events | Append-only hot tables |
| Slow analytics queries | Pre-aggregated cold tables |
| Expensive GROUP BY | Async aggregation workers |
| Real-time dashboards | Live status tables |

This pattern is widely used in:
- IoT platforms
- FinTech ledgers
- Observability systems
- Time-series analytics

---

## Queue-Based Design

### Why Queues?

We intentionally **do not process analytics synchronously** because:

- Telemetry traffic is bursty
- Aggregations are expensive
- APIs must remain fast
- Failures must be retryable

Queues give us:
- Backpressure handling
- Retry & delay
- Horizontal scaling
- Isolation of concerns

---

## Queue Types

### 1. Telemetry Queue

**Purpose**
- Accept raw telemetry events
- Decouple ingestion from storage

**Produces**
- Telemetry Worker jobs

---

### 2. Analytics Aggregation Queue

**Purpose**
- Perform time-bucket aggregation
- Convert raw telemetry → analytics rows

**Produces**
- Hourly & daily rollups

---

## Workers

### Telemetry Worker

**Responsibilities**
- Validate incoming telemetry
- Write to:
  - Live tables
  - Telemetry history tables
- Enqueue aggregation jobs

**Why separate worker?**
- Keeps API fast
- Allows horizontal scaling
- Safe retries on failure

---

### Aggregation Worker

**Responsibilities**
- Consume aggregation jobs
- Aggregate telemetry in time windows
- Upsert hourly / daily tables

**Key Properties**
- Idempotent (safe re-runs)
- Time-bucketed
- Deterministic outputs

---

## Aggregation Flow

Telemetry Event
│
▼
Telemetry Worker
│
├─ Write to History
│
├─ Update Live Status
│
▼
Enqueue Aggregation Job
│
▼
Aggregation Worker
│
├─ Read telemetry in time window
├─ Compute totals / averages
└─ Upsert cold tables



---

## Why Upserts?

- Avoid duplicate aggregates
- Safe retries
- Idempotency
- Allows late-arriving telemetry

---

## Analytics API Design

Analytics APIs **never touch raw telemetry tables**.

They query only:
- `MeterEnergyHourly`
- `MeterEnergyDaily`
- `VehicleEnergyHourly`

Benefits:
- Predictable performance
- No heavy GROUP BY
- Easy caching
- API stability

---

## Scalability Considerations

### Horizontal Scaling
- Multiple workers per queue
- Stateless services
- Redis-backed coordination

### Backfill Support
- Historical telemetry preserved
- Aggregation jobs can be replayed
- Safe for corrections

### Failure Handling
- Job retries
- Idempotent aggregation
- No partial writes

---

## Why This Design?

This architecture was chosen because it:

✅ Handles **high ingestion rates**  
✅ Keeps **APIs fast**  
✅ Scales horizontally  
✅ Supports **reprocessing & backfills**  
✅ Separates concerns cleanly  
✅ Matches real-world IoT & analytics systems  

This is a **production-grade, industry-proven pattern**.

---

## Future Enhancements

- Weekly / monthly aggregates
- Partitioned telemetry tables
- Data retention policies
- Materialized views (optional)
- Streaming consumers (Kafka / Pulsar)
- Multi-tenant sharding

---

## Summary

This system intentionally separates:

- **Ingestion vs Analytics**
- **Hot vs Cold data**
- **Real-time vs Historical**
- **Write-heavy vs Read-heavy paths**

Resulting in a platform that is:
**fast, scalable, resilient, and easy to evolve**.

---

🧠 _Design inspired by large-scale telemetry systems used in EV platforms, smart grids, and observability stacks._
