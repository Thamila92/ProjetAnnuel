import { DataSource, SelectQueryBuilder } from "typeorm";
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
        const query: SelectQueryBuilder<Projet> = this.db.createQueryBuilder(Projet, 'projet')
            .leftJoinAndSelect('projet.steps', 'step')
            .where('projet.isDeleted = :isDeleted', { isDeleted: false })
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);
    
        const [projets, totalCount] = await query.getManyAndCount();
    
        const currentDate = new Date();
    
        projets.forEach(async (projet) => {
            if (currentDate > projet.ending) {
                projet.state = 'ENDED';
            } else if (currentDate > projet.starting && currentDate < projet.ending) {
                projet.state = 'RUNNING';
            } else if (currentDate.toDateString() === projet.starting.toDateString()) {
                projet.state = 'STARTED';
            } else {
                projet.state = 'UNSTARTED';
            }
    
            await this.db.getRepository(Projet).save(projet); 
        });
    
        return {
            projets,
            totalCount
        };
    }
    

    async createProjet(project: CreateProjetParams): Promise<Projet | string> {
        const userRepo = this.db.getRepository(User);
        const projetRepo = this.db.getRepository(Projet);
    
        // Chercher l'utilisateur par ID
        const userFound = await userRepo.findOne({ where: { id: project.userId, isDeleted: false } });
        if (!userFound) {
            return "User not found";
        }
    
        // Déterminer l'état initial basé sur les dates
        const currentDate = new Date();
        let state = 'UNSTARTED';
        if (currentDate > project.ending) {
            state = 'ENDED';
        } else if (currentDate > project.starting && currentDate < project.ending) {
            state = 'RUNNING';
        } else if (currentDate.toDateString() === new Date(project.starting).toDateString()) {
            state = 'STARTED';
        }
    
        // Créer le projet
        const newProjet = projetRepo.create({
            description: project.description,
            starting: project.starting,
            ending: project.ending,
            user: userFound,
            state: state
        });
    
        // Sauvegarder le projet
        await projetRepo.save(newProjet);
    
        return newProjet;
    }
    
    

    async getProjet(id: number): Promise<Projet | null> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id, isDeleted: false } });
        return projetFound || null;
    }
    async getAllProjet(id: number): Promise<Projet | null> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id } });
        return projetFound || null;
    }


    async updateProjet(id: number, params: UpdateProjetParams): Promise<Projet | string | null> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id, isDeleted: false } });
        if (!projetFound) return null;
    
        let newStarting = params.starting || projetFound.starting;
        let newEnding = params.ending || projetFound.ending;
    
        // Rechercher les projets chevauchants
        const overlappingProjects = await repo.createQueryBuilder("projet")
            .where("projet.id != :id", { id })
            .andWhere("projet.isDeleted = :isDeleted", { isDeleted: false })
            .andWhere("projet.starting < :newEnding", { newEnding })
            .andWhere("projet.ending > :newStarting", { newStarting })
            .getMany();
    
        if (overlappingProjects.length > 0) {
            return 'Les nouvelles dates chevauchent un autre projet';
        }
    
        if (params.description) projetFound.description = params.description;
        if (params.starting) projetFound.starting = params.starting;
        if (params.ending) projetFound.ending = params.ending;
    
        // Mettre à jour l'état en fonction des nouvelles dates
        const currentDate = new Date();
        if (currentDate > newEnding) {
            projetFound.state = 'ENDED';
        } else if (currentDate > newStarting && currentDate < newEnding) {
            projetFound.state = 'RUNNING';
        } else if (currentDate.toDateString() === new Date(newStarting).toDateString()) {
            projetFound.state = 'STARTED';
        } else {
            projetFound.state = 'UNSTARTED';
        }
    
        const updatedProjet = await repo.save(projetFound);
        return updatedProjet;
    }
    
    

    async deleteProjet(id: number): Promise<boolean | Projet> {
        const repo = this.db.getRepository(Projet);
        const projetFound = await repo.findOne({ where: { id, isDeleted: false } });
        if (!projetFound) return false;
    
        projetFound.isDeleted = true;
        await repo.save(projetFound);
        return projetFound;
    }
    
}
