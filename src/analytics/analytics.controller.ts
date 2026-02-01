import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get meter analytics
   */
  @Get('meters/:meterId')
  async getMeterAnalytics(@Param('meterId') meterId: string) {
    return this.analyticsService.getMeterAnalytics(meterId);
  }

  /**
   * Get consumption trends
   */
  @Get('trends/:meterId')
  async getTrends(
    @Param('meterId') meterId: string,
    @Query('days') days: string = '30',
  ) {
    return this.analyticsService.getConsumptionTrends(
      meterId,
      parseInt(days, 10),
    );
  }

  /**
   * Compare multiple meters
   */
  @Get('compare')
  async compareMeters(@Query('meters') meterIds: string) {
    const ids = meterIds.split(',');
    return this.analyticsService.compareMeters(ids);
  }

  /**
   * Detect anomalies
   */
  @Get('anomalies/:meterId')
  async detectAnomalies(@Param('meterId') meterId: string) {
    return this.analyticsService.detectAnomalies(meterId);
  }

  /**
   * Get dashboard summary
   */
  @Get('dashboard/summary')
  async getDashboardSummary() {
    return this.analyticsService.getDashboardSummary();
  }
}
