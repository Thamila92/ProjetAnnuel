import { DataSource } from "typeorm";
import { Evenement } from "../database/entities/evenement";

export interface ListEvenementFilter {
    limit: number;
    page: number;
}

export interface UpdateEvenementParams {
    name?: string;
    date?: Date;
}

export class EvenementUsecase {
    constructor(private readonly db: DataSource) { }

    async listEvenement(listEvenementFilter: ListEvenementFilter): Promise<{ evenements: Evenement[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Evenement, 'evenement')
            .skip((listEvenementFilter.page - 1) * listEvenementFilter.limit)
            .take(listEvenementFilter.limit);

        const [evenements, totalCount] = await query.getManyAndCount();
        return {
            evenements,
            totalCount
        };
    }

    async updateEvenement(id: number, { name, date }: UpdateEvenementParams): Promise<Evenement | null> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ where: { id } }); 
        if (!evenementFound) return null;
    
        if (name) {
            evenementFound.name = name;
        }
        if (date) {
            evenementFound.createdAt = date;
        }
    
        const updatedEvenement = await repo.save(evenementFound);
        return updatedEvenement;
    }
    

    async getEvenement(id: number): Promise<Evenement | null> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ where: { id } });
        return evenementFound || null;
    }

    async deleteEvenement(id: number): Promise<boolean> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound =await repo.findOne({ where: { id } });
        if (!evenementFound) return false;

        await repo.remove(evenementFound);
        return true;
    }
}
