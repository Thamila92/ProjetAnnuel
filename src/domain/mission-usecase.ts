import { DataSource } from "typeorm";
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

    async createMission(starting: Date, ending: Date, description: string,eventId:number): Promise<Mission | string> {
        const missionRepo = this.db.getRepository(Mission);
        const eventRepo = this.db.getRepository(Evenement);

        // Chercher l'événement par ID
        const eventFound = await eventRepo.findOne({ where: { id: eventId } });
        if (!eventFound) {
            return "Event not found";
        }

        // Vérifier si les dates de la mission sont comprises entre les dates de l'événement
        if (starting < eventFound.starting || ending > eventFound.ending) {
            return "Mission dates must be within the event's dates";
        }
    
        // Vérifier qu'il n'y a pas d'autres missions définies sur la même période
        const conflictingMissions = await missionRepo.createQueryBuilder('mission')
            .where(':starting < mission.ending AND :ending > mission.starting', { starting, ending })
            .getMany();
    
        if (conflictingMissions.length > 0) {
            return "Conflicting mission exists";
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

    async updateMission(id: number, params: UpdateMissionParams): Promise<Mission | null> {
        const repo = this.db.getRepository(Mission);
        const missionFound = await repo.findOne({ where: { id } });
        if (!missionFound) return null;

        if (params.starting) missionFound.starting = params.starting;
        if (params.ending) missionFound.ending = params.ending;
        if (params.description) missionFound.description = params.description;

        const updatedMission = await repo.save(missionFound);
        return updatedMission;
    }

    async deleteMission(id: number): Promise<boolean> {
        const repo = this.db.getRepository(Mission);
        const missionFound = await repo.findOne({ where: { id } });
        if (!missionFound) return false;

        await repo.remove(missionFound);
        return true;
    }
}
