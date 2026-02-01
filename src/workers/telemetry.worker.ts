import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Processor('telemetry')
@Injectable()
export class TelemetryWorker {
  private readonly logger = new Logger(TelemetryWorker.name);

  constructor(private readonly prisma: PrismaService) { }

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
      throw error; // Bull will retry
    }
  }

  /**
   * VEHICLE telemetry processing
   */
  private async processVehicleTelemetry(event: {
    vehicleId: string;
    soc: number;
    batteryTemp: number;
    kwhDeliveredDc: number;
    timestamp: string;
  }) {
    const timestamp = new Date(event.timestamp);

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

      // 2️⃣ Hot path — latest state
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
  }

  /**
   * METER telemetry processing
   */
  private async processMeterTelemetry(event: {
    meterId: string;
    voltage: number;
    kwhConsumedAc: number;
    timestamp: string;
  }) {
    const timestamp = new Date(event.timestamp);

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

      // 2️⃣ Hot path — latest state
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
  }

  /**
   * Queue-level failure hook
   */
  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} permanently failed after retries`,
      error.stack,
    );
  }
}
