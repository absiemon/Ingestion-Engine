import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TelemetryWorker } from '../workers/telemetry.worker';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'telemetry',
    }),
  ],
  providers: [TelemetryWorker, PrismaService],
})
export class TelemetryModule { }
