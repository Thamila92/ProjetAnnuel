import { DataSource, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
import { Mission } from "../database/entities/mission";
import { Evenement } from "../database/entities/evenement";

export interface ListMissionFilter {
    limit: number;
    page: number;
}

export interface UpdateMissionParams {
    starting?: Date;
    ending?: Date;
    description?: string;
}

export class MissionUsecase {
    constructor(private readonly db: DataSource) { }

    async listMissions(filter: ListMissionFilter): Promise<{ missions: Mission[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Mission, 'mission')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [missions, totalCount] = await query.getManyAndCount();
        return {
            missions,
            totalCount
        };
    }

    async createMission(starting: Date, ending: Date, description: string, eventId: number): Promise<Mission | string> {
        const missionRepo = this.db.getRepository(Mission);
        const eventRepo = this.db.getRepository(Evenement);
    
        // Chercher l'événement par ID et vérifier qu'il n'est pas supprimé
        const eventFound = await eventRepo.findOne({ where: { id: eventId, isDeleted: false } });
        if (!eventFound) {
            return "Event not found or is deleted";
        }
    
        // Vérifier si les dates de la mission sont comprises entre les dates de l'événement
        if (starting < eventFound.starting || ending > eventFound.ending) {
            return "Mission dates must be within the event's dates";
        }
    
        // Vérifier qu'il n'y a pas d'autres missions du même événement définies sur la même période
        const conflictingMissions = await missionRepo.createQueryBuilder('mission')
            .where('mission.evenement = :eventId', { eventId })
            .andWhere(':starting < mission.ending AND :ending > mission.starting', { starting, ending })
            .getMany();
    
        if (conflictingMissions.length > 0) {
            return "Conflicting mission exists within the same event";
        }
    
        // Créer et sauvegarder la nouvelle mission
        const newMission = missionRepo.create({ starting, ending, description, evenement: eventFound });
        await missionRepo.save(newMission);
        return newMission;
    }
    
    

    async getMission(id: number): Promise<Mission | null> {
        const repo = this.db.getRepository(Mission);
        const missionFound = await repo.findOne({ where: { id } });
        return missionFound || null;
    }

    async updateMission(id: number, params: UpdateMissionParams): Promise<Mission | null | string> {
        const repo = this.db.getRepository(Mission);
        const evenementRepo = this.db.getRepository(Evenement); 
    
        // Trouver la mission à mettre à jour
        const missionFound = await repo.findOne({
            where: { id },
            relations: ['evenement'], // Ensure 'evenement' is loaded
        });
        if (!missionFound) return null;
    
        // Récupérer l'événement associé et vérifier qu'il n'est pas supprimé
        const evenement = missionFound.evenement;
        if (!evenement || evenement.isDeleted) return "Associated event not found or is deleted";
    
        // Déterminer les nouvelles dates de début et de fin
        const newStarting = params.starting || missionFound.starting;
        const newEnding = params.ending || missionFound.ending;
    
        // Vérifier si la nouvelle période de la mission est dans la période de l'événement
        if (newStarting < evenement.starting || newEnding > evenement.ending) {
            return "La période de la mission doit être comprise dans celle de l'événement."
        }
    
        // Vérifier les conflits de périodes avec d'autres missions
        const conflictingMissions = await repo.find({
            where: {
                evenement: evenement,
                id: Not(id), // Exclure la mission actuelle
                starting: LessThanOrEqual(newEnding),
                ending: MoreThanOrEqual(newStarting),
            },
        });
    
        if (conflictingMissions.length > 0) {
            return "Il existe déjà une mission sur cette période."
        }
    
        // Mettre à jour la mission
        if (params.starting) missionFound.starting = params.starting;
        if (params.ending) missionFound.ending = params.ending;
        if (params.description) missionFound.description = params.description;
    
        const updatedMission = await repo.save(missionFound);
        return updatedMission;
    }
    
    
    async deleteMission(id: number): Promise<boolean | Mission> {
        const repo = this.db.getRepository(Mission);
        const missionFound = await repo.findOne({ where: { id } });
        if (!missionFound) return false;

        await repo.remove(missionFound);
        return missionFound;
    }
}
