import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('telemetry')
    private readonly telemetryQueue: Queue,

    @InjectQueue('analytics')
    private readonly analyticsQueue: Queue,
  ) { }

  /**
   * Publish telemetry event (vehicle or meter)
   */
  async publishTelemetry(event: {
    type: 'VEHICLE' | 'METER';
    vehicleId?: string;
    meterId?: string;
    soc?: number;
    batteryTemp?: number;
    kwhDeliveredDc?: number;
    voltage?: number;
    kwhConsumedAc?: number;
    timestamp: string;
  }) {
    await this.telemetryQueue.add('telemetry-event', event);
  }

  // ================= ANALYTICS =================

  async enqueueVehicleHourlyAggregation(payload: {
    vehicleId: string;
    windowStart: string;
    windowEnd: string;
  }) {
    await this.analyticsQueue.add(
      'vehicle-hourly-aggregation',
      payload,
      {
        jobId: `vehicle:${payload.vehicleId}:${payload.windowStart}`,
        removeOnComplete: true,
      },
    );
  }

  async enqueueMeterHourlyAggregation(payload: {
    meterId: string;
    windowStart: string;
    windowEnd: string;
  }) {
    await this.analyticsQueue.add(
      'meter-hourly-aggregation',
      payload,
      {
        jobId: `meter:${payload.meterId}:${payload.windowStart}`,
        removeOnComplete: true,
      },
    );
  }
}
