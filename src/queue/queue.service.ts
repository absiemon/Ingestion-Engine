import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('ingest') private ingestQueue: Queue,
    @InjectQueue('telemetry') private telemetryQueue: Queue,
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  /**
   * Add a job to the ingest queue
   * Used for processing incoming meter/vehicle data
   */
  async addIngestJob(data: any, options?: any) {
    return this.ingestQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      ...options,
    });
  }

  /**
   * Add a job to the telemetry queue
   * Used for processing real-time telemetry data
   */
  async addTelemetryJob(data: any, options?: any) {
    return this.telemetryQueue.add(data, {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 1000,
      },
      removeOnComplete: true,
      ...options,
    });
  }

  /**
   * Add a job to the analytics queue
   * Used for aggregating and analyzing data
   */
  async addAnalyticsJob(data: any, options?: any) {
    return this.analyticsQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: false,
      ...options,
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress(),
      attempts: job.attemptsMade,
      data: job.data,
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string) {
    const queue = this.getQueue(queueName);
    return {
      waiting: await queue.getWaitingCount(),
      active: await queue.getActiveCount(),
      completed: await queue.getCompletedCount(),
      failed: await queue.getFailedCount(),
      delayed: await queue.getDelayedCount(),
    };
  }

  private getQueue(name: string): Queue {
    if (name === 'ingest') return this.ingestQueue;
    if (name === 'telemetry') return this.telemetryQueue;
    if (name === 'analytics') return this.analyticsQueue;
    throw new Error(`Unknown queue: ${name}`);
  }
}
