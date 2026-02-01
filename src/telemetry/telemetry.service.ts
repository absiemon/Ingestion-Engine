import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TelemetryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Record telemetry data for a meter or vehicle
   */
  async recordTelemetry(data: {
    type: 'meter' | 'vehicle';
    meterId?: string;
    vehicleId?: string;
    data: Record<string, any>;
  }) {
    return this.prisma.telemetry.create({
      data: {
        type: data.type,
        meterId: data.meterId,
        vehicleId: data.vehicleId,
        data: data.data,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get telemetry data for a meter
   */
  async getMeterTelemetry(meterId: string, limit: number = 100) {
    return this.prisma.telemetry.findMany({
      where: { meterId, type: 'meter' },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Get telemetry data for a vehicle
   */
  async getVehicleTelemetry(vehicleId: string, limit: number = 100) {
    return this.prisma.telemetry.findMany({
      where: { vehicleId, type: 'vehicle' },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Get unprocessed telemetry records
   */
  async getUnprocessedTelemetry(limit: number = 1000) {
    return this.prisma.telemetry.findMany({
      where: { processed: false },
      orderBy: { timestamp: 'asc' },
      take: limit,
    });
  }

  /**
   * Mark telemetry as processed
   */
  async markAsProcessed(telemetryId: string) {
    return this.prisma.telemetry.update({
      where: { id: telemetryId },
      data: { processed: true },
    });
  }

  /**
   * Bulk mark telemetry as processed
   */
  async bulkMarkAsProcessed(telemetryIds: string[]) {
    return this.prisma.telemetry.updateMany({
      where: { id: { in: telemetryIds } },
      data: { processed: true },
    });
  }

  /**
   * Get telemetry statistics
   */
  async getTelemetryStats() {
    const [total, processed, unprocessed, byType] = await Promise.all([
      this.prisma.telemetry.count(),
      this.prisma.telemetry.count({ where: { processed: true } }),
      this.prisma.telemetry.count({ where: { processed: false } }),
      this.prisma.telemetry.groupBy({
        by: ['type'],
        _count: true,
      }),
    ]);

    return {
      total,
      processed,
      unprocessed,
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
    };
  }
}
