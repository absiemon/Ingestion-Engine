import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('telemetry')
    private readonly telemetryQueue: Queue,
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
}
