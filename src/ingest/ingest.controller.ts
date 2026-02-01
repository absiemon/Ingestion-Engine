import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IngestService } from './ingest.service';
import { CreateMeterDto, UpdateMeterDto } from './dto/meter.dto';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Controller('api/ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  // ============ METER ENDPOINTS ============

  /**
   * Create a new meter and enqueue for processing
   */
  @Post('meters')
  @HttpCode(HttpStatus.CREATED)
  async createMeter(@Body() createMeterDto: CreateMeterDto) {
    return this.ingestService.createMeter(createMeterDto);
  }

  /**
   * Bulk ingest meter data
   */
  @Post('meters/bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkIngestMeters(@Body() meters: CreateMeterDto[]) {
    return this.ingestService.bulkIngestMeters(meters);
  }

  /**
   * Get meter by ID
   */
  @Get('meters/:id')
  async getMeter(@Param('id') id: string) {
    return this.ingestService.getMeter(id);
  }

  /**
   * Get all meters with pagination
   */
  @Get('meters')
  async getAllMeters(
    @Param('skip') skip: number = 0,
    @Param('take') take: number = 10,
  ) {
    return this.ingestService.getAllMeters(skip, take);
  }

  /**
   * Update meter
   */
  @Put('meters/:id')
  async updateMeter(
    @Param('id') id: string,
    @Body() updateMeterDto: UpdateMeterDto,
  ) {
    return this.ingestService.updateMeter(id, updateMeterDto);
  }

  /**
   * Delete meter
   */
  @Delete('meters/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMeter(@Param('id') id: string) {
    return this.ingestService.deleteMeter(id);
  }

  // ============ VEHICLE ENDPOINTS ============

  /**
   * Create a new vehicle
   */
  @Post('vehicles')
  @HttpCode(HttpStatus.CREATED)
  async createVehicle(@Body() createVehicleDto: CreateVehicleDto) {
    return this.ingestService.createVehicle(createVehicleDto);
  }

  /**
   * Bulk ingest vehicle data
   */
  @Post('vehicles/bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkIngestVehicles(@Body() vehicles: CreateVehicleDto[]) {
    return this.ingestService.bulkIngestVehicles(vehicles);
  }

  /**
   * Get vehicle by ID
   */
  @Get('vehicles/:id')
  async getVehicle(@Param('id') id: string) {
    return this.ingestService.getVehicle(id);
  }

  /**
   * Get all vehicles with pagination
   */
  @Get('vehicles')
  async getAllVehicles(
    @Param('skip') skip: number = 0,
    @Param('take') take: number = 10,
  ) {
    return this.ingestService.getAllVehicles(skip, take);
  }

  /**
   * Update vehicle
   */
  @Put('vehicles/:id')
  async updateVehicle(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.ingestService.updateVehicle(id, updateVehicleDto);
  }

  /**
   * Delete vehicle
   */
  @Delete('vehicles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVehicle(@Param('id') id: string) {
    return this.ingestService.deleteVehicle(id);
  }

  // ============ HEALTH CHECK ============

  /**
   * Health check endpoint
   */
  @Get('health')
  async health() {
    return { status: 'ok', timestamp: new Date() };
  }
}
