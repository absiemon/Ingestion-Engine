import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bull';
import { Job } from 'bull';
import { TelemetryService } from '../telemetry/telemetry.service';
import { PrismaService } from '../database/prisma.service';

/**
 * Telemetry Worker - Processes telemetry data from the queue
 * Handles validation, transformation, and storage of meter and vehicle data
 */
@Processor('telemetry')
@Injectable()
export class TelemetryWorker extends WorkerHost {
  constructor(
    private telemetryService: TelemetryService,
    private prisma: PrismaService,
  ) {
    super();
  }

  /**
   * Main job processor
   */
  async process(job: Job<any>) {
    try {
      const { type, meterId, vehicleId, data } = job.data;

      switch (type) {
        case 'meter':
          await this.processMeterTelemetry(meterId, data);
          break;
        case 'vehicle':
          await this.processVehicleTelemetry(vehicleId, data);
          break;
        default:
          throw new Error(`Unknown telemetry type: ${type}`);
      }

      return { success: true, processedAt: new Date() };
    } catch (error) {
      console.error(`Error processing telemetry job ${job.id}:`, error);
      throw error;
    }
  }

  /**
   * Process meter telemetry data
   */
  private async processMeterTelemetry(
    meterId: string,
    data: Record<string, any>,
  ) {
    await this.telemetryService.recordTelemetry({
      type: 'meter',
      meterId,
      data: {
        voltage: data.voltage,
        current: data.current,
        power: data.power,
        energy: data.energy,
        quality: this.calculatePowerQuality(data),
      },
    });
  }

  /**
   * Process vehicle telemetry data
   */
  private async processVehicleTelemetry(
    vehicleId: string,
    data: Record<string, any>,
  ) {
    await this.telemetryService.recordTelemetry({
      type: 'vehicle',
      vehicleId,
      data: {
        location: data.location,
        speed: data.speed,
        battery: data.battery,
        status: data.status,
      },
    });
  }

  /**
   * Calculate power quality metrics
   */
  private calculatePowerQuality(data: any) {
    // Simple example - calculate power factor
    return {
      powerFactor: (data.power / (data.voltage * data.current)) || 0,
      harmonic: 0, // Would calculate actual harmonics
    };
  }

  /**
   * Worker event listeners
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`✓ Telemetry job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`✗ Telemetry job ${job.id} failed:`, err.message);
  }

  @OnWorkerEvent('error')
  onError(err: Error) {
    console.error('Telemetry worker error:', err);
  }
}
