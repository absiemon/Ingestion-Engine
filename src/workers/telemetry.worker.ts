import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';

@Processor('telemetry')
@Injectable()
export class TelemetryWorker {
  private readonly logger = new Logger(TelemetryWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) { }

  /**
   * Main telemetry processor
   */
  @Process('telemetry-event')
  async handleTelemetry(job: Job<any>) {
    const event = job.data;

    try {
      if (event.type === 'VEHICLE') {
        await this.processVehicleTelemetry(event);
      } else if (event.type === 'METER') {
        await this.processMeterTelemetry(event);
      } else {
        throw new Error(`Unsupported telemetry type: ${event.type}`);
      }

      return { processedAt: new Date() };
    } catch (error) {
      this.logger.error(
        `Telemetry job ${job.id} failed`,
        error.stack,
      );
      throw error; // Bull retry
    }
  }

  // ================= VEHICLE =================

  private async processVehicleTelemetry(event: {
    vehicleId: string;
    soc: number;
    batteryTemp: number;
    kwhDeliveredDc: number;
    timestamp: string;
  }) {
    const timestamp = new Date(event.timestamp);
    const { start, end } = this.getHourWindow(timestamp);

    await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Cold path — append-only history
      await tx.vehicleTelemetryHistory.create({
        data: {
          vehicleId: event.vehicleId,
          soc: event.soc,
          batteryTemp: event.batteryTemp,
          kwhDeliveredDc: event.kwhDeliveredDc,
          timestamp,
        },
      });

      // 2️⃣ Hot path — latest snapshot
      await tx.vehicleLiveStatus.upsert({
        where: { vehicleId: event.vehicleId },
        update: {
          soc: event.soc,
          batteryTemp: event.batteryTemp,
          lastKwhDc: event.kwhDeliveredDc,
          updatedAt: new Date(),
        },
        create: {
          vehicleId: event.vehicleId,
          soc: event.soc,
          batteryTemp: event.batteryTemp,
          lastKwhDc: event.kwhDeliveredDc,
        },
      });
    });

    // 3️⃣ Enqueue vehicle hourly aggregation
    await this.queueService.enqueueVehicleHourlyAggregation({
      vehicleId: event.vehicleId,
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
    });
  }

  // ================= METER =================

  private async processMeterTelemetry(event: {
    meterId: string;
    voltage: number;
    kwhConsumedAc: number;
    timestamp: string;
  }) {
    const timestamp = new Date(event.timestamp);
    const { start, end } = this.getHourWindow(timestamp);

    await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Cold path — append-only history
      await tx.meterTelemetryHistory.create({
        data: {
          meterId: event.meterId,
          voltage: event.voltage,
          kwhConsumedAc: event.kwhConsumedAc,
          timestamp,
        },
      });

      // 2️⃣ Hot path — latest snapshot
      await tx.meterLiveStatus.upsert({
        where: { meterId: event.meterId },
        update: {
          voltage: event.voltage,
          lastKwhAc: event.kwhConsumedAc,
          updatedAt: new Date(),
        },
        create: {
          meterId: event.meterId,
          voltage: event.voltage,
          lastKwhAc: event.kwhConsumedAc,
        },
      });
    });

    // 3️⃣ Enqueue meter hourly aggregation
    await this.queueService.enqueueMeterHourlyAggregation({
      meterId: event.meterId,
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
    });
  }

  // ================= HELPERS =================

  private getHourWindow(timestamp: Date) {
    const start = new Date(timestamp);
    start.setMinutes(0, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    return { start, end };
  }

  // ================= EVENTS =================

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} permanently failed`,
      error.stack,
    );
  }
}
