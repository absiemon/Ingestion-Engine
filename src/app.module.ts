import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import * as Joi from 'joi';

// Infra Modules
import { DatabaseModule } from './database/database.module';

// Feature Modules
import { QueueModule } from './queue/queue.module';
import { IngestModule } from './ingest/ingest.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    // ========= CONFIG =========
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),

        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),

        PORT: Joi.number().default(3000),
        LOG_LEVEL: Joi.string().default('info'),
      }),
    }),

    // ========= DATABASE =========
    DatabaseModule,

    // ========= QUEUE (REDIS) =========
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        prefix: 'energy-platform',
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
        settings: {
          stalledInterval: 30000,
          maxStalledCount: 2,
        },
      }),
    }),

    // ========= FEATURE MODULES =========
    QueueModule,
    IngestModule,
    TelemetryModule,
    AnalyticsModule,
  ],
})
export class AppModule { }
