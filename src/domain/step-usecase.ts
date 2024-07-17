import { DataSource } from "typeorm";
import { Step } from "../database/entities/step";
import { Projet } from "../database/entities/projet";
import { Mission } from "../database/entities/mission";

export interface ListStepFilter {
    limit: number;
    page: number;
}

export interface UpdateStepParams {
    state?: string;
    description?: string;
    starting?: Date;
    ending?: Date;
    projetId?: number;
    missionId?: number;
}

export class StepUsecase {
    constructor(private readonly db: DataSource) { }

    async listSteps(filter: ListStepFilter): Promise<{ steps: Step[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Step, 'step')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [steps, totalCount] = await query.getManyAndCount();
        return {
            steps,
            totalCount
        };
    }

    async createStep(state: string, description: string, starting: Date, ending: Date, projetId: number): Promise<Step> {
        const projetRepo = this.db.getRepository(Projet);
        const projet = await projetRepo.findOne({ where: { id: projetId } });
        if (!projet) {
            throw new Error('Projet not found');
        }
    
        // Vérification que les dates de l'étape sont encadrées par celles du projet
        if (new Date(starting) < new Date(projet.starting) || new Date(ending) > new Date(projet.ending)) {
            throw new Error('Step dates must be within the project dates');
        }
    
        const stepRepo = this.db.getRepository(Step);
    
        // Vérification des chevauchements d'étapes pour le même projet
        const overlappingSteps = await stepRepo.createQueryBuilder("step")
            .where("step.projetId = :projetId", { projetId })
            .andWhere("step.starting < :ending AND step.ending > :starting", { starting, ending })
            .getCount();
    
        if (overlappingSteps > 0) {
            throw new Error('There is already a step planned for the same project during this period');
        }
    
        const newStep = stepRepo.create({ state, description, starting, ending, projet });
        await stepRepo.save(newStep);
        return newStep;
    }
    
    

    async getStep(id: number): Promise<Step | null> {
        const repo = this.db.getRepository(Step);
        const stepFound = await repo.findOne({ where: { id } });
        return stepFound || null;
    }

    async updateStep(id: number, params: UpdateStepParams): Promise<Step | null> {
        const repo = this.db.getRepository(Step);
        const stepFound = await repo.findOne({ where: { id }, relations: ["projet"] });
        if (!stepFound) return null;
    
        if (params.projetId && params.projetId !== stepFound.projet.id) {
            const projetRepo = this.db.getRepository(Projet);
            const projet = await projetRepo.findOne({ where: { id: params.projetId } });
            if (!projet) {
                throw new Error('Projet not found');
            }
            stepFound.projet = projet;
        }
    
        if (params.state) stepFound.state = params.state;
        if (params.description) stepFound.description = params.description;
        if (params.starting) stepFound.starting = params.starting;
        if (params.ending) stepFound.ending = params.ending;
    
        const projet = stepFound.projet;
        if (stepFound.starting < projet.starting || stepFound.ending > projet.ending) {
            throw new Error('Step dates must be within the project dates');
        }
    
        const overlappingSteps = await repo.createQueryBuilder("step")
            .where("step.projetId = :projetId", { projetId: projet.id })
            .andWhere("step.id != :id", { id })
            .andWhere("step.starting < :ending AND step.ending > :starting", { starting: stepFound.starting, ending: stepFound.ending })
            .getCount();
    
        if (overlappingSteps > 0) {
            throw new Error('There is already a step planned for the same project during this period');
        }
    
        if (params.missionId) {
            const missionRepo = this.db.getRepository(Mission);
            const mission = await missionRepo.findOne({ where: { id: params.missionId } });
            if (mission) {
                stepFound.mission = mission;
            }
        }
    
        const updatedStep = await repo.save(stepFound);
        return updatedStep;
    }
    

    async deleteStep(id: number): Promise<boolean> {
        const repo = this.db.getRepository(Step);
        const stepFound = await repo.findOne({ where: { id } });
        if (!stepFound) return false;

        await repo.remove(stepFound);
        return true;
    }
}
