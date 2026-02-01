import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';
import { CreateMeterDto, UpdateMeterDto } from './dto/meter.dto';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class IngestService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  // ============ METER METHODS ============

  /**
   * Create a new meter and enqueue for processing
   */
  async createMeter(createMeterDto: CreateMeterDto) {
    try {
      // Create meter in database
      const meter = await this.prisma.meter.create({
        data: {
          meterId: createMeterDto.meterId,
          deviceId: createMeterDto.deviceId,
          voltage: createMeterDto.voltage,
          current: createMeterDto.current,
          power: createMeterDto.power,
          energy: createMeterDto.energy,
          location: createMeterDto.location,
          timestamp: createMeterDto.timestamp
            ? new Date(createMeterDto.timestamp)
            : new Date(),
        },
      });

      // Enqueue for processing
      await this.queueService.addIngestJob({
        type: 'meter',
        meterId: meter.id,
        data: createMeterDto,
      });

      return {
        success: true,
        meter,
        message: 'Meter created and queued for processing',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create meter: ${error.message}`,
      );
    }
  }

  /**
   * Bulk ingest meters
   */
  async bulkIngestMeters(meters: CreateMeterDto[]) {
    const results = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (const meterDto of meters) {
      try {
        await this.createMeter(meterDto);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          meter: meterDto.meterId,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get meter by ID
   */
  async getMeter(id: string) {
    const meter = await this.prisma.meter.findUnique({
      where: { id },
      include: {
        telemetry: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!meter) {
      throw new NotFoundException(`Meter with ID ${id} not found`);
    }

    return meter;
  }

  /**
   * Get all meters with pagination
   */
  async getAllMeters(skip: number = 0, take: number = 10) {
    const [meters, total] = await Promise.all([
      this.prisma.meter.findMany({
        skip: Math.max(0, skip),
        take: Math.min(take, 100),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.meter.count(),
    ]);

    return {
      data: meters,
      pagination: {
        skip: Math.max(0, skip),
        take: Math.min(take, 100),
        total,
      },
    };
  }

  /**
   * Update meter
   */
  async updateMeter(id: string, updateMeterDto: UpdateMeterDto) {
    try {
      const meter = await this.prisma.meter.update({
        where: { id },
        data: updateMeterDto,
      });

      // Enqueue update event
      await this.queueService.addIngestJob({
        type: 'meter_update',
        meterId: id,
        data: updateMeterDto,
      });

      return meter;
    } catch (error) {
      throw new NotFoundException(`Meter with ID ${id} not found`);
    }
  }

  /**
   * Delete meter
   */
  async deleteMeter(id: string) {
    try {
      await this.prisma.meter.delete({
        where: { id },
      });
      return { success: true, message: 'Meter deleted' };
    } catch (error) {
      throw new NotFoundException(`Meter with ID ${id} not found`);
    }
  }

  // ============ VEHICLE METHODS ============

  /**
   * Create a new vehicle
   */
  async createVehicle(createVehicleDto: CreateVehicleDto) {
    try {
      const vehicle = await this.prisma.vehicle.create({
        data: {
          vehicleId: createVehicleDto.vehicleId,
          regNumber: createVehicleDto.regNumber,
          brand: createVehicleDto.brand,
          model: createVehicleDto.model,
          year: createVehicleDto.year,
          type: createVehicleDto.type,
        },
      });

      // Enqueue for processing
      await this.queueService.addIngestJob({
        type: 'vehicle',
        vehicleId: vehicle.id,
        data: createVehicleDto,
      });

      return {
        success: true,
        vehicle,
        message: 'Vehicle created and queued for processing',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create vehicle: ${error.message}`,
      );
    }
  }

  /**
   * Bulk ingest vehicles
   */
  async bulkIngestVehicles(vehicles: CreateVehicleDto[]) {
    const results = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (const vehicleDto of vehicles) {
      try {
        await this.createVehicle(vehicleDto);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          vehicle: vehicleDto.vehicleId,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get vehicle by ID
   */
  async getVehicle(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        telemetry: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  /**
   * Get all vehicles with pagination
   */
  async getAllVehicles(skip: number = 0, take: number = 10) {
    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        skip: Math.max(0, skip),
        take: Math.min(take, 100),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count(),
    ]);

    return {
      data: vehicles,
      pagination: {
        skip: Math.max(0, skip),
        take: Math.min(take, 100),
        total,
      },
    };
  }

  /**
   * Update vehicle
   */
  async updateVehicle(id: string, updateVehicleDto: UpdateVehicleDto) {
    try {
      const vehicle = await this.prisma.vehicle.update({
        where: { id },
        data: updateVehicleDto,
      });

      // Enqueue update event
      await this.queueService.addIngestJob({
        type: 'vehicle_update',
        vehicleId: id,
        data: updateVehicleDto,
      });

      return vehicle;
    } catch (error) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(id: string) {
    try {
      await this.prisma.vehicle.delete({
        where: { id },
      });
      return { success: true, message: 'Vehicle deleted' };
    } catch (error) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
  }
}
