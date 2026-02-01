import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  // Historical analytics
  @Get('meters/:meterId')
  getMeterAnalytics(@Param('meterId') meterId: string) {
    return this.analyticsService.getMeterAnalytics(meterId);
  }

  // Trends (daily aggregates)
  @Get('trends/:meterId')
  getTrends(
    @Param('meterId') meterId: string,
    @Query('days') days = '30',
  ) {
    return this.analyticsService.getConsumptionTrends(
      meterId,
      Number(days),
    );
  }

  // Comparison
  @Get('compare')
  compareMeters(@Query('meters') meters: string) {
    return this.analyticsService.compareMeters(meters.split(','));
  }

  // Dashboard = LIVE + AGG
  @Get('dashboard/summary')
  getDashboardSummary() {
    return this.analyticsService.getDashboardSummary();
  }
}
