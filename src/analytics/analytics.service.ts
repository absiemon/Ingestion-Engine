import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private readonly queueService: QueueService
  ) { }

  /**
   * Get analytics for a specific meter
   */
  async getMeterAnalytics(meterId: string) {
    const data = await this.prisma.meterHourlyAgg.findMany({
      where: { meterId },
      orderBy: { hour: 'desc' },
      take: 168, // last 7 days
    });

    return {
      meterId,
      granularity: 'hourly',
      data,
    };
  }


  /**
   * Get energy consumption trends
   */
  async getConsumptionTrends(meterId: string, days: number) {
    const start = new Date();
    start.setDate(start.getDate() - days);

    const data = await this.prisma.meterDailyAgg.findMany({
      where: {
        meterId,
        day: { gte: start },
      },
      orderBy: { day: 'asc' },
    });

    return {
      meterId,
      range: `${days} days`,
      totalEnergy: data.reduce((s, d) => s + d.totalKwh, 0),
      data,
    };
  }


  /**
   * Calculate comparative analytics between meters
   */
  async compareMeters(meterIds: string[]) {
    const stats = await this.prisma.meterDailyAgg.groupBy({
      by: ['meterId'],
      where: { meterId: { in: meterIds } },
      _sum: { totalKwh: true },
      _avg: { avgPower: true },
    });

    return {
      comparison: stats.map(s => ({
        meterId: s.meterId,
        totalEnergy: s._sum.totalKwh ?? 0,
        avgPower: s._avg.avgPower ?? 0,
      })),
    };
  }


  /**
   * Get dashboard summary
   */
  async getDashboardSummary() {
    const [meters, vehicles, energyToday] = await Promise.all([
      this.prisma.meter.count(),
      this.prisma.vehicle.count(),
      this.prisma.meterDailyAgg.aggregate({
        where: {
          day: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        _sum: { totalKwh: true },
      }),
    ]);

    return {
      meters,
      vehicles,
      energyToday: energyToday._sum.totalKwh ?? 0,
      generatedAt: new Date(),
    };
  }

  /**
   * Enqueue hourly aggregation job
   */
  async enqueueAggregationJob(params: {
    scope: 'vehicle' | 'meter';
    entityId: string;
    timestamp: Date;
  }) {
    const hourStart = new Date(params.timestamp);
    hourStart.setMinutes(0, 0, 0);

    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    return this.queueService.addAnalyticsJob(
      {
        scope: params.scope,
        entityId: params.entityId,
        bucket: 'hourly',
        windowStart: hourStart.toISOString(),
        windowEnd: hourEnd.toISOString(),
      },
      {
        jobId: `${params.scope}:${params.entityId}:${hourStart.toISOString()}`,
      },
    );
  }
}
