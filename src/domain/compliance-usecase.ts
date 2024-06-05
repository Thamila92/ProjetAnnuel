import { DataSource } from "typeorm";
import { Compliance } from "../database/entities/compliance";
import { Mission } from "../database/entities/mission";
import { User } from "../database/entities/user";

export interface ListComplianceFilter {
    limit: number;
    page: number;
}

export interface UpdateComplianceParams {
    description?: string;
    status?: string;
}

export class ComplianceUsecase {
    constructor(private readonly db: DataSource) { }

    async listCompliances(filter: ListComplianceFilter): Promise<{ compliances: Compliance[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Compliance, 'compliance')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [compliances, totalCount] = await query.getManyAndCount();
        return {
            compliances,
            totalCount
        };
    }

    // async createCompliance(description: string, status: string, userId: number, missionId: number): Promise<Compliance> {
    //     const missionRepo = this.db.getRepository(Mission);
    //     const mission = await missionRepo.findOne({ where: { id: missionId } });
    //     if (!mission) {
    //         throw new Error('Mission not found');
    //     }

    //     const userRepo = this.db.getRepository(User);
    //     const user = await userRepo.findOne({ where: { id: userId } });
    //     if (!user) {
    //         throw new Error('User not found');
    //     }

    //     const complianceRepo = this.db.getRepository(Compliance);
    //     const newCompliance = complianceRepo.create({ description, status, mission, user });
    //     await complianceRepo.save(newCompliance);
    //     return newCompliance;
    // }

    async getCompliance(id: number): Promise<Compliance | null> {
        const repo = this.db.getRepository(Compliance);
        const complianceFound = await repo.findOne({ where: { id } });
        return complianceFound || null;
    }

    async updateCompliance(id: number, params: UpdateComplianceParams): Promise<Compliance | null> {
        const repo = this.db.getRepository(Compliance);
        const complianceFound = await repo.findOne({ where: { id } });
        if (!complianceFound) return null;

        if (params.description) complianceFound.description = params.description;
        if (params.status) complianceFound.status = params.status;

        const updatedCompliance = await repo.save(complianceFound);
        return updatedCompliance;
    }

    async deleteCompliance(id: number): Promise<boolean> {
        const repo = this.db.getRepository(Compliance);
        const complianceFound = await repo.findOne({ where: { id } });
        if (!complianceFound) return false;

        await repo.remove(complianceFound);
        return true;
    }
}
