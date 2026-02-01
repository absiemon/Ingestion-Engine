import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../database/prisma.service';

@Processor('analytics')
@Injectable()
export class AggregationWorker {
  constructor(private readonly prisma: PrismaService) {}

  // ================= VEHICLE =================

  @Process('vehicle-hourly-aggregation')
  async vehicleHourly(job: Job<{
    vehicleId: string;
    windowStart: string;
    windowEnd: string;
  }>) {
    const { vehicleId, windowStart, windowEnd } = job.data;

    const from = new Date(windowStart);
    const to = new Date(windowEnd);

    const rows = await this.prisma.vehicleTelemetryHistory.findMany({
      where: {
        vehicleId,
        timestamp: {
          gte: from,
          lt: to,
        },
      },
    });

    if (rows.length === 0) return;

    const totalDc = rows.reduce(
      (sum, r) => sum + r.kwhDeliveredDc,
      0,
    );

    const avgBatteryTemp =
      rows.reduce((sum, r) => sum + r.batteryTemp, 0) / rows.length;

    await this.prisma.vehicleEnergyHourly.upsert({
      where: {
        vehicleId_hour: {
          vehicleId,
          hour: from,
        },
      },
      create: {
        vehicleId,
        hour: from,
        totalDc,
        totalAc: 0,
        avgBatteryTemp,
      },
      update: {
        totalDc,
        avgBatteryTemp,
      },
    });
  }

  // ================= METER =================

  @Process('meter-hourly-aggregation')
  async meterHourly(job: Job<{
    meterId: string;
    windowStart: string;
    windowEnd: string;
  }>) {
    const { meterId, windowStart, windowEnd } = job.data;

    const from = new Date(windowStart);
    const to = new Date(windowEnd);

    const rows = await this.prisma.meterTelemetryHistory.findMany({
      where: {
        meterId,
        timestamp: {
          gte: from,
          lt: to,
        },
      },
    });

    if (rows.length === 0) return;

    const totalAc = rows.reduce(
      (sum, r) => sum + r.kwhConsumedAc,
      0,
    );

    const avgVoltage =
      rows.reduce((sum, r) => sum + r.voltage, 0) / rows.length;

    await this.prisma.meterEnergyHourly.upsert({
      where: {
        meterId_hour: {
          meterId,
          hour: from,
        },
      },
      create: {
        meterId,
        hour: from,
        totalAc,
        avgVoltage,
      },
      update: {
        totalAc,
        avgVoltage,
      },
    });
  }
}
