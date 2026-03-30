import { Injectable, NotFoundException } from "@nestjs/common";
import { RestockQueueRepository } from "./restock-queue.repository";
import { RestockPriority } from "./schemas/restock-queue.schema";

@Injectable()
export class RestockQueueService {
    constructor(
        private readonly restockRepository: RestockQueueRepository,
        // private readonly activityLogService: ActivityLogService,
    ) { }


    private calcPriority(stock: number, threshold: number): RestockPriority {
        if (stock === 0) return RestockPriority.HIGH;
        if (stock <= Math.ceil(threshold * 0.5)) return RestockPriority.MEDIUM;
        return RestockPriority.LOW;
    }

    async addIfNeeded(
        productId: string,
        productName: string,
        currentStock: number,
        threshold: number,
        userId: string,
    ): Promise<boolean> {
        if (currentStock >= threshold) return false;

        const priority = this.calcPriority(currentStock, threshold);

        await this.restockRepository.upsert(productId, {
            priority,
            stockAtTimeOfAdding: currentStock,
            threshold,
        });

        // await this.activityLogService.log({
        //     action: 'RESTOCK_QUEUE_ADDED',
        //     entity: 'product',
        //     entityId: productId,
        //     userId,
        //     meta: { name: productName, currentStock, priority },
        // });

        return true;
    }

    async remove(
        productId: string,
        productName: string,
        userId: string,
    ): Promise<boolean> {
        const deleted = await this.restockRepository.deleteByProduct(productId);

        // if (deleted) {
        //     await this.activityLogService.log({
        //         action: 'RESTOCK_QUEUE_REMOVED',
        //         entity: 'product',
        //         entityId: productId,
        //         userId,
        //         meta: { name: productName },
        //     });
        //     return true;
        // }

        return false;
    }

    async findAll() {
        return this.restockRepository.findAll();
    }
    async count(): Promise<number> {
        return this.restockRepository.count();
    }
    async manualAdd(productId: string, userId: string) {
        const entry = await this.restockRepository.upsert(productId, {
            priority: RestockPriority.HIGH,
            stockAtTimeOfAdding: 0,
            threshold: 0,
        });

        await entry.populate('product', 'name stock minStockThreshold');

        // await this.activityLogService.log({
        //     action: 'RESTOCK_QUEUE_ADDED',
        //     entity: 'product',
        //     entityId: productId,
        //     userId,
        //     meta: { name: (entry.product as any)?.name ?? productId },
        // });

        return entry;
    }

    async manualRemove(productId: string, userId: string) {
        const entry = await this.restockRepository.findOneWithProduct(productId);

        if (!entry) {
            throw new NotFoundException('Product not in restock queue');
        }

        await this.restockRepository.deleteDocument(entry);

        // await this.activityLogService.log({
        //     action: 'RESTOCK_QUEUE_REMOVED',
        //     entity: 'product',
        //     entityId: productId,
        //     userId,
        //     meta: { name: (entry.product as any)?.name ?? productId },
        // });

        return { message: 'Removed from restock queue' };
    }
}
