import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IngestService } from './ingest.service';
import { VehicleTelemetryDto } from './dto/vehicle.dto';
import { MeterTelemetryDto } from './dto/meter.dto';

@Controller('v1/ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) { }

  /**
   * Vehicle telemetry ingestion
   */
  @Post('vehicle')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestVehicle(@Body() payload: VehicleTelemetryDto) {
    await this.ingestService.ingestVehicleTelemetry(payload);
    return { status: 'accepted' };
  }

  /**
   * Meter telemetry ingestion
   */
  @Post('meter')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestMeter(@Body() payload: MeterTelemetryDto) {
    await this.ingestService.ingestMeterTelemetry(payload);
    return { status: 'accepted' };
  }

  /**
   * Health check
   */
  @Post('health')
  health() {
    return { status: 'ok', time: new Date() };
  }
}
