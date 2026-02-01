import { Injectable, BadRequestException } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { VehicleTelemetryDto } from './dto/vehicle.dto';
import { MeterTelemetryDto } from './dto/meter.dto';

@Injectable()
export class IngestService {
  constructor(private readonly queueService: QueueService) { }

  /**
   * Ingest vehicle telemetry (ASYNC)
   */
  async ingestVehicleTelemetry(payload: VehicleTelemetryDto) {
    try {
      await this.queueService.publishTelemetry({
        type: 'VEHICLE',
        vehicleId: payload.vehicleId,
        soc: payload.soc,
        batteryTemp: payload.batteryTemp,
        kwhDeliveredDc: payload.kwhDeliveredDc,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
    } catch (err) {
      throw new BadRequestException('Failed to enqueue vehicle telemetry');
    }
  }

  /**
   * Ingest meter telemetry (ASYNC)
   */
  async ingestMeterTelemetry(payload: MeterTelemetryDto) {
    try {
      await this.queueService.publishTelemetry({
        type: 'METER',
        meterId: payload.meterId,
        voltage: payload.voltage,
        kwhConsumedAc: payload.kwhConsumedAc,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
    } catch (err) {
      throw new BadRequestException('Failed to enqueue meter telemetry');
    }
  }
}
