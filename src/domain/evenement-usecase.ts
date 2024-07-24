 
import { DataSource, FindOneOptions, FindOptionsWhere } from "typeorm";
import { Evenement, repetitivity } from "../database/entities/evenement";
 
 
 import { Mission } from "../database/entities/mission";
import { AppDataSource } from "../database/database";
import { eventtype } from "../types/event-types";
import { Location } from "../database/entities/location";
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
    isVirtual?: boolean;
    virtualLink?: string;
    repetitivity?: string;
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
// <<<<<<< HEAD
            .leftJoinAndSelect('evenement.location', 'location')
// =======
//             .leftJoinAndSelect('evenement.location', 'location')  
//             .leftJoinAndSelect('evenement.mission', 'mission')   

// >>>>>>> e13ce5da6e3b4b9ede92d9419da8b573ce103965
            .where('evenement.isDeleted = :isDeleted', { isDeleted: false })
            .orderBy('evenement.starting', 'DESC')  // Order by starting date in descending order
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);
    
        const [evenements, totalCount] = await query.getManyAndCount();
    
        const currentDate = new Date();
    
        for (const evenement of evenements) {
            if (currentDate > evenement.ending) {
                evenement.state = 'ENDED';
            } else if (currentDate > evenement.starting && currentDate < evenement.ending) {
                evenement.state = 'RUNNING';
            } else if (currentDate.toDateString() === evenement.starting.toDateString()) {
                evenement.state = 'STARTED';
            } else {
                evenement.state = 'UNSTARTED';
            }
    
            await this.db.getRepository(Evenement).save(evenement);  
        }
    
        return {
            evenements,
            totalCount
        };
    }
    
    
    
    
    
 
    async getEvenement(id: number): Promise<Evenement | null> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ 
            where: { id, isDeleted: false },
            relations: ['location'] // Inclure la relation location
        });
        return evenementFound || null;
    }
    async updateEvenement(id: number, params: UpdateEvenementParams): Promise<Evenement | null | string> {
        const repo = this.db.getRepository(Evenement);
        const locationRepo = this.db.getRepository(Location);
    
        const evenementFound = await repo.findOne({ where: { id, isDeleted: false }, relations: ["location"] });
        if (!evenementFound) return null;
    
        if (params.type === "AG" && !params.quorum) {
            return "You must specify the Quorum";
        }
    
        if (params.type) {
            const isValidEventType = Object.values(eventtype).includes(params.type as eventtype);
            if (!isValidEventType) {
                return "Invalid event type";
            }
            evenementFound.typee = params.type as eventtype;
        }
    
        if (params.description) evenementFound.description = params.description;
        if (params.quorum) evenementFound.quorum = params.quorum;
        if (params.repetitivity) evenementFound.repetitivity = params.repetitivity as repetitivity;
        if (params.isVirtual !== undefined) evenementFound.isVirtual = params.isVirtual;
        if (params.virtualLink !== undefined) evenementFound.virtualLink = params.virtualLink;
    
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
    
        if (params.location) {
            let locFound = await locationRepo.findOne({ where: { position: params.location } as FindOptionsWhere<Location> });
    
            if (!locFound) {
                locFound = locationRepo.create({ position: params.location });
                await locationRepo.save(locFound);
            }
    
            evenementFound.location = [locFound];
        }
    
        // Mettre à jour l'état en fonction des nouvelles dates
        const currentDate = new Date();
        if (currentDate > evenementFound.ending) {
            evenementFound.state = 'ENDED';
        } else if (currentDate > evenementFound.starting && currentDate < evenementFound.ending) {
            evenementFound.state = 'RUNNING';
        } else if (currentDate.toDateString() === evenementFound.starting.toDateString()) {
            evenementFound.state = 'STARTED';
        } else {
            evenementFound.state = 'UNSTARTED';
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
 