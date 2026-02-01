export class VehicleTelemetryDto {
  vehicleId: string;
  soc: number;
  batteryTemp: number;
  kwhDeliveredDc: number;
  timestamp?: string;
}
