import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get analytics for a specific meter
   */
  async getMeterAnalytics(meterId: string) {
    const analytics = await this.prisma.analytics.findMany({
      where: { meterId },
      orderBy: { startTime: 'desc' },
      take: 100,
    });

    return {
      meterId,
      data: analytics,
      summary: this.calculateSummary(analytics),
    };
  }

  /**
   * Aggregate meter data for a specific period
   */
  async aggregateMeterData(
    meterId: string,
    period: 'hourly' | 'daily' | 'monthly',
  ) {
    const meterData = await this.prisma.meter.findUnique({
      where: { id: meterId },
    });

    if (!meterData) {
      throw new Error(`Meter ${meterId} not found`);
    }

    // Simple aggregation - in production, would query historical data
    const analytics = await this.prisma.analytics.create({
      data: {
        meterId,
        period,
        avgPower: meterData.power,
        maxPower: meterData.power,
        minPower: meterData.power,
        totalEnergy: meterData.energy,
        dataPoints: 1,
        startTime: new Date(Date.now() - this.getPeriodMs(period)),
        endTime: new Date(),
      },
    });

    return analytics;
  }

  /**
   * Get energy consumption trends
   */
  async getConsumptionTrends(meterId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.prisma.meter.findMany({
      where: {
        id: meterId,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    });

    return {
      meterId,
      period: `Last ${days} days`,
      dataPoints: data.length,
      data: data.map((d) => ({
        timestamp: d.timestamp,
        power: d.power,
        energy: d.energy,
      })),
    };
  }

  /**
   * Calculate comparative analytics between meters
   */
  async compareMeters(meterIds: string[]) {
    const metrics = await Promise.all(
      meterIds.map(async (id) => {
        const meter = await this.prisma.meter.findUnique({
          where: { id },
        });
        return {
          meterId: id,
          power: meter?.power || 0,
          energy: meter?.energy || 0,
        };
      }),
    );

    return {
      comparison: metrics,
      avgPower: metrics.reduce((sum, m) => sum + m.power, 0) / metrics.length,
      totalEnergy: metrics.reduce((sum, m) => sum + m.energy, 0),
    };
  }

  /**
   * Get anomaly detection insights
   */
  async detectAnomalies(meterId: string) {
    const recentData = await this.prisma.meter.findMany({
      where: { id: meterId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    if (recentData.length === 0) return { anomalies: [] };

    const avgPower =
      recentData.reduce((sum, d) => sum + d.power, 0) / recentData.length;
    const stdDev = this.calculateStdDev(
      recentData.map((d) => d.power),
      avgPower,
    );

    const anomalies = recentData.filter(
      (d) => Math.abs(d.power - avgPower) > 2 * stdDev,
    );

    return {
      meterId,
      avgPower,
      stdDev,
      anomalies: anomalies.map((a) => ({
        timestamp: a.timestamp,
        power: a.power,
        deviation: ((a.power - avgPower) / avgPower) * 100,
      })),
    };
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary() {
    const [meterCount, vehicleCount, totalEnergy, avgPower] =
      await Promise.all([
        this.prisma.meter.count(),
        this.prisma.vehicle.count(),
        this.prisma.meter.aggregate({
          _sum: { energy: true },
        }),
        this.prisma.meter.aggregate({
          _avg: { power: true },
        }),
      ]);

    return {
      meters: meterCount,
      vehicles: vehicleCount,
      totalEnergy: totalEnergy._sum?.energy || 0,
      avgPower: avgPower._avg?.power || 0,
      timestamp: new Date(),
    };
  }

  // ============ HELPER METHODS ============

  private calculateSummary(analytics: any[]) {
    if (analytics.length === 0) return null;

    const avgPower =
      analytics.reduce((sum, a) => sum + a.avgPower, 0) / analytics.length;
    const maxPower = Math.max(...analytics.map((a) => a.maxPower));
    const totalEnergy = analytics.reduce((sum, a) => sum + a.totalEnergy, 0);

    return { avgPower, maxPower, totalEnergy };
  }

  private getPeriodMs(period: string): number {
    switch (period) {
      case 'hourly':
        return 60 * 60 * 1000;
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  private calculateStdDev(values: number[], mean: number): number {
    const squareDiffs = values.map((v) => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }
}
