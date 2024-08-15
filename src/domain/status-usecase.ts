import { DataSource } from "typeorm";
import { Status, statustype } from "../database/entities/status";
import { CreateStatusValidationRequest } from "../handlers/validators/status-validator";

export class StatusUsecase {
    constructor(private readonly db: DataSource) {}

    // CREATE a new status
    async createStatus(params: CreateStatusValidationRequest): Promise<Status | string> {
        const statusRepo = this.db.getRepository(Status);

        const newStatus = statusRepo.create({
            type: params.type as statustype,   
            key: params.key || null,
        });

        try {
            const savedStatus = await statusRepo.save(newStatus);
            return savedStatus;
        } catch (error) {
            console.error(error);
            return "Failed to create status";
        }
    }

    // READ/List all statuses
    async listStatuses(): Promise<Status[]> {
        const statusRepo = this.db.getRepository(Status);
        return await statusRepo.find();
    }

    // READ/Get one status by ID
    async getStatusById(id: number): Promise<Status | null> {
        const statusRepo = this.db.getRepository(Status);
        const status = await statusRepo.findOne({ where: { id } });
        return status || null;
    }

    // UPDATE a status
    async updateStatus(id: number, params: Partial<CreateStatusValidationRequest>): Promise<Status | string> {
        const statusRepo = this.db.getRepository(Status);
        const statusFound = await statusRepo.findOne({ where: { id } });

        if (!statusFound) {
            return "Status not found";
        }

        if (params.type) {
            statusFound.type = params.type as statustype;
        }

        if (params.key !== undefined) {
            statusFound.key = params.key || null;
        }

        try {
            const updatedStatus = await statusRepo.save(statusFound);
            return updatedStatus;
        } catch (error) {
            console.error(error);
            return "Failed to update status";
        }
    }

    // DELETE a status
    async deleteStatus(id: number): Promise<Status | string> {
        const statusRepo = this.db.getRepository(Status);
        const statusFound = await statusRepo.findOne({ where: { id } });

        if (!statusFound) {
            return "Status not found";
        }

        try {
            await statusRepo.remove(statusFound);
            return statusFound;
        } catch (error) {
            console.error(error);
            return "Failed to delete status";
        }
    }
}
