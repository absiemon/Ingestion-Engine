import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TelemetryService } from './telemetry.service';
import { TelemetryWorker } from '../workers/telemetry.worker';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'telemetry' })],
  providers: [TelemetryService, TelemetryWorker, PrismaService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
