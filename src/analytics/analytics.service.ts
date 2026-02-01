import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) { }

  // ================= METER ANALYTICS =================

  /**
   * Get hourly analytics for a meter (last 7 days)
   */
  async getMeterAnalytics(meterId: string) {
    const data = await this.prisma.meterEnergyHourly.findMany({
      where: { meterId },
      orderBy: { hour: 'desc' },
      take: 168, // 24 * 7
    });

    return {
      meterId,
      granularity: 'hourly',
      data,
    };
  }

  /**
   * Get daily consumption trends
   */
  async getConsumptionTrends(meterId: string, days: number) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const data = await this.prisma.meterEnergyDaily.findMany({
      where: {
        meterId,
        day: { gte: start },
      },
      orderBy: { day: 'asc' },
    });

    return {
      meterId,
      range: `${days} days`,
      totalEnergy: data.reduce((sum, d) => sum + d.totalAc, 0),
      data,
    };
  }

  /**
   * Compare meters by total daily energy
   */
  async compareMeters(meterIds: string[]) {
    const stats = await this.prisma.meterEnergyDaily.groupBy({
      by: ['meterId'],
      where: { meterId: { in: meterIds } },
      _sum: { totalAc: true },
      _avg: { avgVoltage: true },
    });

    return {
      comparison: stats.map((s) => ({
        meterId: s.meterId,
        totalEnergy: s._sum.totalAc ?? 0,
        avgVoltage: s._avg.avgVoltage ?? 0,
      })),
    };
  }

  /**
   * Dashboard summary
   */
  async getDashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [meters, vehicles, energyToday] = await Promise.all([
      this.prisma.meter.count(),
      this.prisma.vehicle.count(),
      this.prisma.meterEnergyDaily.aggregate({
        where: { day: today },
        _sum: { totalAc: true },
      }),
    ]);

    return {
      meters,
      vehicles,
      energyToday: energyToday._sum.totalAc ?? 0,
      generatedAt: new Date(),
    };
  }

  // ================= AGGREGATION QUEUE =================

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

    if (params.scope === 'meter') {
      return this.queueService.enqueueMeterHourlyAggregation({
        meterId: params.entityId,
        windowStart: hourStart.toISOString(),
        windowEnd: hourEnd.toISOString(),
      });
    }

    return this.queueService.enqueueVehicleHourlyAggregation({
      vehicleId: params.entityId,
      windowStart: hourStart.toISOString(),
      windowEnd: hourEnd.toISOString(),
    });
  }
}
