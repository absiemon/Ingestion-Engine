import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  vehicleId: string;

  @IsString()
  regNumber: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsString()
  @IsEnum(['EV', 'Hybrid', 'ICE', 'Other'])
  type: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;
}

export class VehicleResponseDto {
  id: string;
  vehicleId: string;
  regNumber: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  status: string;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}
