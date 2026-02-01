export class MeterTelemetryDto {
  meterId: string;
  voltage: number;
  kwhConsumedAc: number;
  timestamp?: string;
}
