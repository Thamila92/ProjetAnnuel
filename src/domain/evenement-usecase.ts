import { DataSource } from "typeorm";
import { Evenement, eventtype } from "../database/entities/evenement";
import { Mission } from "../database/entities/mission";
import { AppDataSource } from "../database/database";
import { eventtype } from "../types/event-types";

export interface ListEvenementFilter {
    limit: number;
    page: number;
}

export interface UpdateEvenementParams {
    type?: string;
    location?: number;
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
            .where('evenement.isDeleted = :isDeleted', { isDeleted: false })
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);
    
        const [evenements, totalCount] = await query.getManyAndCount();
        return {
            evenements,
            totalCount
        };
    }
    
    

    // async createEvenement(ev: EventToCreate): Promise<Evenement | string | undefined> {
    //     if (ev.type == "AG" && !ev.quorum) {
    //         return "Veuillez preciser le Quorum !!!";
    //     }
    
    //     const evenementRepo = this.db.getRepository(Evenement);
    
    //     // Vérification de l'existence d'un événement avec les mêmes dates de début et de fin
    //     const existingEvenement = await evenementRepo.findOne({
    //         where: { starting: ev.starting, ending: ev.ending }
    //     });
    
    //     if (existingEvenement) {
    //         return "Un événement avec les mêmes dates de début et de fin existe déjà.";
    //     }
    
    //     const newEvenement = evenementRepo.create({
    //         type: ev.type,
    //         location: ev.location,
    //         description: ev.description,
    //         quorum: ev.quorum,
    //         starting: ev.starting,
    //         ending: ev.ending
    //     });
    
    //     await evenementRepo.save(newEvenement);
    //     return newEvenement;
    // }
    

    async getEvenement(id: number): Promise<Evenement | null> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ where: { id, isDeleted: false } });
        return evenementFound || null;
    }

    async updateEvenement(id: number, params: UpdateEvenementParams): Promise<Evenement | null | string> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ where: { id, isDeleted: false } });
    
        if (!evenementFound) return null;
    
        if (params.type === "AG" && !params.quorum) {
            return "You must specify the Quorum";
        }
        
        if (params.type){
            // Vérifiez si la chaîne est une valeur valide de l'énumération
            const isValidEventType = Object.values(eventtype).includes(params.type as eventtype);

            if (isValidEventType) {
                const eventType: eventtype = params.type as eventtype;
                console.log(eventType); // OUTPUT: EventType.Click
            } else {
                console.error("Invalid event type");
            }
        }
        // if (params.location) evenementFound.location = params.location;
        if (params.description) evenementFound.description = params.description;
        if (params.quorum) evenementFound.quorum = params.quorum;
    
        const { starting, ending } = params;
    
        if (starting || ending) {
            const checkStarting = starting || evenementFound.starting;
            const checkEnding = ending || evenementFound.ending;
    
            const conflictingEvents = await repo.createQueryBuilder('event')
                .where(':starting < event.ending AND :ending > event.starting', { starting: checkStarting, ending: checkEnding })
                .andWhere('event.id != :id', { id })
                .andWhere('event.isDeleted = false')
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
        const evenementFound = await repo.findOne({ where: { id, isDeleted: false } });
        if (!evenementFound) return "Event not found";
    
        evenementFound.isDeleted = true;
        await repo.save(evenementFound);
        return evenementFound;
    }
    
    
}
 