import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateMeterDto {
  @IsString()
  meterId: string;

  @IsString()
  deviceId: string;

  @IsNumber()
  voltage: number;

  @IsNumber()
  current: number;

  @IsNumber()
  power: number;

  @IsNumber()
  energy: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

export class UpdateMeterDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  voltage?: number;

  @IsOptional()
  @IsNumber()
  current?: number;

  @IsOptional()
  @IsNumber()
  power?: number;

  @IsOptional()
  @IsNumber()
  energy?: number;
}

export class MeterResponseDto {
  id: string;
  meterId: string;
  deviceId: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  location?: string;
  status: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
