import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../database/prisma.service';

export interface AggregationJobPayload {
    scope: 'vehicle' | 'meter';
    entityId: string;
    bucket: 'hourly';
    windowStart: string;
    windowEnd: string;
}

@Processor('analytics-aggregation')
@Injectable()
export class AggregationWorker extends WorkerHost {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async process(job: Job<AggregationJobPayload>) {
        const { scope, entityId, bucket, windowStart, windowEnd } = job.data;

        if (bucket !== 'hourly') {
            throw new Error(`Unsupported bucket: ${bucket}`);
        }

        if (scope === 'vehicle') {
            await this.aggregateVehicleHourly(
                entityId,
                new Date(windowStart),
                new Date(windowEnd),
            );
        }

        if (scope === 'meter') {
            await this.aggregateMeterHourly(
                entityId,
                new Date(windowStart),
                new Date(windowEnd),
            );
        }

        return { success: true };
    }

    // ================= VEHICLE =================

    private async aggregateVehicleHourly(
        vehicleId: string,
        from: Date,
        to: Date,
    ) {
        const rows = await this.prisma.vehicleTelemetryHistory.findMany({
            where: {
                vehicleId,
                timestamp: {
                    gte: from,
                    lt: to,
                },
            },
        });

        if (rows.length === 0) return;

        const totalDc = rows.reduce(
            (sum, r) => sum + r.kwhDeliveredDc,
            0,
        );

        const avgBatteryTemp =
            rows.reduce((sum, r) => sum + r.batteryTemp, 0) / rows.length;

        await this.prisma.vehicleEnergyHourly.upsert({
            where: {
                vehicleId_hour: {
                    vehicleId,
                    hour: from,
                },
            },
            create: {
                vehicleId,
                hour: from,
                totalDc,
                totalAc: 0,
                avgBatteryTemp,
            },
            update: {
                totalDc,
                avgBatteryTemp,
            },
        });
    }

    // ================= METER =================

    private async aggregateMeterHourly(
        meterId: string,
        from: Date,
        to: Date,
    ) {
        const rows = await this.prisma.meterTelemetryHistory.findMany({
            where: {
                meterId,
                timestamp: {
                    gte: from,
                    lt: to,
                },
            },
        });

        if (rows.length === 0) return;

        const totalAc = rows.reduce(
            (sum, r) => sum + r.kwhConsumedAc,
            0,
        );

        await this.prisma.meterEnergyHourly.upsert({
            where: {
                meterId_hour: {
                    meterId,
                    hour: from,
                },
            },
            create: {
                meterId,
                hour: from,
                totalAc,
            },
            update: {
                totalAc,
            },
        });
    }

    // ================= EVENTS =================

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        console.log(`✓ Aggregation job ${job.id} completed`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, err: Error) {
        console.error(`✗ Aggregation job ${job.id} failed`, err.message);
    }
}
