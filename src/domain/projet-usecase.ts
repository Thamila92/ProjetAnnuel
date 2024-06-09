import { DataSource } from "typeorm";
import { Projet } from "../database/entities/projet";
import { User } from "../database/entities/user";

export interface ListProjetFilter {
    limit: number;
    page: number;
}

export interface UpdateProjetParams {
    description?: string;
    starting?: Date;
    ending?: Date;
}

export interface CreateProjetParams {
    description: string;
    starting: Date;
    ending: Date;
    userId:number
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
    async createProjet(project: CreateProjetParams): Promise<Projet | string> {
        const userRepo = this.db.getRepository(User);
        const projetRepo = this.db.getRepository(Projet);
    
        // Chercher l'utilisateur par ID
        const userFound = await userRepo.findOne({ where: { id: project.userId } });
        if (!userFound) {
            return "User not found";
        }
    
        // Créer le projet
        const newProjet = projetRepo.create({
            description: project.description,
            starting: project.starting,
            ending: project.ending,
            user: userFound
        });
    
        // Sauvegarder le projet
        await projetRepo.save(newProjet);
    
        return newProjet;
    }
    

    async getProjet(id: number): Promise<Projet | null> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id } });
        return projetFound || null;
    }

    async updateProjet(id: number, params: UpdateProjetParams): Promise<Projet | string | null> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id } });
        if (!projetFound) return null;
    
        let newStarting = params.starting || projetFound.starting;
        let newEnding = params.ending || projetFound.ending;
    
        // Rechercher les projets chevauchants
        const overlappingProjects = await repo.createQueryBuilder("projet")
            .where("projet.id != :id", { id })
            .andWhere("projet.starting < :newEnding", { newEnding })
            .andWhere("projet.ending > :newStarting", { newStarting })
            .getMany();
    
        if (overlappingProjects.length > 0) {
            return 'Les nouvelles dates chevauchent un autre projet';
        }
    
        if (params.description) projetFound.description = params.description;
        if (params.starting) projetFound.starting = params.starting;
        if (params.ending) projetFound.ending = params.ending;
    
        const updatedProjet = await repo.save(projetFound);
        return updatedProjet;
    }
    

    async deleteProjet(id: number): Promise<boolean|Projet> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id } });
        if (!projetFound) return false;

        await repo.remove(projetFound);
        return projetFound;
    }
}
