import { Module } from '@nestjs/common';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';
import { PrismaService } from '../database/prisma.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [IngestController],
  providers: [IngestService, PrismaService],
  exports: [IngestService],
})
export class IngestModule {}
