-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "regNumber" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meter" (
    "id" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleLiveStatus" (
    "vehicleId" TEXT NOT NULL,
    "soc" DOUBLE PRECISION NOT NULL,
    "batteryTemp" DOUBLE PRECISION NOT NULL,
    "lastKwhDc" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleLiveStatus_pkey" PRIMARY KEY ("vehicleId")
);

-- CreateTable
CREATE TABLE "MeterLiveStatus" (
    "meterId" TEXT NOT NULL,
    "voltage" DOUBLE PRECISION NOT NULL,
    "lastKwhAc" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeterLiveStatus_pkey" PRIMARY KEY ("meterId")
);

-- CreateTable
CREATE TABLE "VehicleTelemetryHistory" (
    "id" BIGSERIAL NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "soc" DOUBLE PRECISION NOT NULL,
    "batteryTemp" DOUBLE PRECISION NOT NULL,
    "kwhDeliveredDc" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleTelemetryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterTelemetryHistory" (
    "id" BIGSERIAL NOT NULL,
    "meterId" TEXT NOT NULL,
    "voltage" DOUBLE PRECISION NOT NULL,
    "kwhConsumedAc" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeterTelemetryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleEnergyHourly" (
    "id" BIGSERIAL NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "hour" TIMESTAMP(3) NOT NULL,
    "totalDc" DOUBLE PRECISION NOT NULL,
    "totalAc" DOUBLE PRECISION NOT NULL,
    "avgBatteryTemp" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleEnergyHourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterEnergyHourly" (
    "id" BIGSERIAL NOT NULL,
    "meterId" TEXT NOT NULL,
    "hour" TIMESTAMP(3) NOT NULL,
    "totalAc" DOUBLE PRECISION NOT NULL,
    "avgVoltage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeterEnergyHourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeterEnergyDaily" (
    "id" BIGSERIAL NOT NULL,
    "meterId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "totalAc" DOUBLE PRECISION NOT NULL,
    "avgVoltage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeterEnergyDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleId_key" ON "Vehicle"("vehicleId");

-- CreateIndex
CREATE INDEX "Vehicle_vehicleId_idx" ON "Vehicle"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Meter_meterId_key" ON "Meter"("meterId");

-- CreateIndex
CREATE INDEX "Meter_meterId_idx" ON "Meter"("meterId");

-- CreateIndex
CREATE INDEX "VehicleLiveStatus_updatedAt_idx" ON "VehicleLiveStatus"("updatedAt");

-- CreateIndex
CREATE INDEX "MeterLiveStatus_updatedAt_idx" ON "MeterLiveStatus"("updatedAt");

-- CreateIndex
CREATE INDEX "VehicleTelemetryHistory_vehicleId_timestamp_idx" ON "VehicleTelemetryHistory"("vehicleId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleTelemetryHistory_vehicleId_timestamp_key" ON "VehicleTelemetryHistory"("vehicleId", "timestamp");

-- CreateIndex
CREATE INDEX "MeterTelemetryHistory_meterId_timestamp_idx" ON "MeterTelemetryHistory"("meterId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "MeterTelemetryHistory_meterId_timestamp_key" ON "MeterTelemetryHistory"("meterId", "timestamp");

-- CreateIndex
CREATE INDEX "VehicleEnergyHourly_vehicleId_hour_idx" ON "VehicleEnergyHourly"("vehicleId", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleEnergyHourly_vehicleId_hour_key" ON "VehicleEnergyHourly"("vehicleId", "hour");

-- CreateIndex
CREATE INDEX "MeterEnergyHourly_meterId_hour_idx" ON "MeterEnergyHourly"("meterId", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "MeterEnergyHourly_meterId_hour_key" ON "MeterEnergyHourly"("meterId", "hour");

-- CreateIndex
CREATE INDEX "MeterEnergyDaily_meterId_day_idx" ON "MeterEnergyDaily"("meterId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "MeterEnergyDaily_meterId_day_key" ON "MeterEnergyDaily"("meterId", "day");
