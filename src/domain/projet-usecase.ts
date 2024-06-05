import { DataSource } from "typeorm";
import { Projet } from "../database/entities/projet";

export interface ListProjetFilter {
    limit: number;
    page: number;
}

export interface UpdateProjetParams {
    description?: string;
    starting?: Date;
    ending?: Date;
}

export class ProjetUsecase {
    constructor(private readonly db: DataSource) { }

    async listProjets(filter: ListProjetFilter): Promise<{ projets: Projet[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Projet, 'projet')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [projets, totalCount] = await query.getManyAndCount();
        return {
            projets,
            totalCount
        };
    }

    async createProjet(description: string, starting: Date, ending: Date): Promise<Projet> {
        const projetRepo = this.db.getRepository(Projet);
        const newProjet = projetRepo.create({ description, starting, ending });
        await projetRepo.save(newProjet);
        return newProjet;
    }

    async getProjet(id: number): Promise<Projet | null> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id } });
        return projetFound || null;
    }

    async updateProjet(id: number, params: UpdateProjetParams): Promise<Projet | null> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id } });
        if (!projetFound) return null;

        if (params.description) projetFound.description = params.description;
        if (params.starting) projetFound.starting = params.starting;
        if (params.ending) projetFound.ending = params.ending;

        const updatedProjet = await repo.save(projetFound);
        return updatedProjet;
    }

    async deleteProjet(id: number): Promise<boolean> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id } });
        if (!projetFound) return false;

        await repo.remove(projetFound);
        return true;
    }
}
