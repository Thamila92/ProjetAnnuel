import { DataSource } from "typeorm";
import { Evenement } from "../database/entities/evenement";
import { Mission } from "../database/entities/mission";
import { AppDataSource } from "../database/database";

export interface ListEvenementFilter {
    limit: number;
    page: number;
}

export interface UpdateEvenementParams {
    type?: string;
    location?: string;
    description?: string;
    quorum?: number;
    starting?: Date;
    ending?: Date;
    missionId?: number;
}

export interface EventToCreate {
    type:string,
    location:string,
    description:string,
    quorum?:number,
    starting:Date,
    ending:Date,
}

export class EvenementUsecase {
    constructor(private readonly db: DataSource) { }

    async listEvenements(filter: ListEvenementFilter): Promise<{ evenements: Evenement[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Evenement, 'evenement')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [evenements, totalCount] = await query.getManyAndCount();
        return {
            evenements,
            totalCount
        };
    }

    // async createEvenement(ev:EventToCreate): Promise<Evenement | string | undefined> {
    //     if(ev.type=="AG" && !ev.quorum){
    //        return " Veuillez preciser le Quorum !!!" 
    //     }
    //     const eventRepository = AppDataSource.getRepository(Event);
    //     const newEvent = eventRepository.create({
    //        type=ev.type,

    //     });

    //     await eventRepository.save(newEvent);

    //     // const eventRepo = this.db.getRepository(Event);
    //     // const event = await missionRepo.findOne({ where: { id: missionId } });
    //     // if (!mission) {
    //     //     throw new Error('Mission not found');
    //     // }

    //     // const evenementRepo = this.db.getRepository(Evenement);
    //     // const newEvenement = evenementRepo.create({ type, location, description, quorum, starting, ending, mission });
    //     // await evenementRepo.save(newEvenement);
    //     // return newEvenement;
    // }

    async getEvenement(id: number): Promise<Evenement | null> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ where: { id } });
        return evenementFound || null;
    }

    async updateEvenement(id: number, params: UpdateEvenementParams): Promise<Evenement | null | string> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ where: { id } });
    
        if (!evenementFound) return null;
    
        if (params.type === "AG" && !params.quorum) {
            return "You must specify the Quorum";
        }
    
        if (params.type) evenementFound.type = params.type;
        if (params.location) evenementFound.location = params.location;
        if (params.description) evenementFound.description = params.description;
        if (params.quorum) evenementFound.quorum = params.quorum;
    
        const { starting, ending } = params;
    
        if (starting || ending) {
            const checkStarting = starting || evenementFound.starting;
            const checkEnding = ending || evenementFound.ending;
    
            const conflictingEvents = await repo.createQueryBuilder('event')
                .where(':starting < event.ending AND :ending > event.starting', { starting: checkStarting, ending: checkEnding })
                .andWhere('event.id != :id', { id })
                .getMany();
    
            if (conflictingEvents.length > 0) {
                return "Conflicting event exists";
            }
    
            if (starting) evenementFound.starting = starting;
            if (ending) evenementFound.ending = ending;
        }
    
        const updatedEvenement = await repo.save(evenementFound);
        return updatedEvenement;
    }
    
    async deleteEvenement(id: number): Promise<boolean | Evenement | string> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ where: { id } });
        if (!evenementFound) return "Event not found";
    
        await repo.remove(evenementFound);
        return evenementFound;
    }
    
}
