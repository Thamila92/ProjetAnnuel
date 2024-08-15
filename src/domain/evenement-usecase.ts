import { DataSource, FindOneOptions, FindOptionsWhere } from "typeorm";
import { Evenement } from "../database/entities/evenement";
import { AppDataSource } from "../database/database";
import { eventtype, repetitivity } from "../types/event-types";   
import { Location } from "../database/entities/location";

export interface ListEvenementFilter {
    limit: number;
    page: number;
}

export interface UpdateEvenementParams {
    type?: eventtype;
    location?: string;
    description?: string;
    quorum?: number;
    starting?: Date;
    ending?: Date;
    isVirtual?: boolean;
    virtualLink?: string;
    repetitivity?: repetitivity;
    maxParticipants?: number;  
}

export interface EventToCreate {
    type: string;
    location: string;
    description: string;
    quorum?: number;
    starting: Date;
    ending: Date;
    maxParticipants: number;
    currentParticipants: number;   
    membersOnly: boolean;   
}

export class EvenementUsecase {
    constructor(private readonly db: DataSource) { }

    async createEvenement(params: EventToCreate): Promise<Evenement> {
        const repo = this.db.getRepository(Evenement);
        const locationRepo = this.db.getRepository(Location);

        let locationFound = await locationRepo.findOne({ where: { position: params.location } });
        if (!locationFound) {
            locationFound = locationRepo.create({ position: params.location });
            await locationRepo.save(locationFound);
        }

        const newEvenement = repo.create({
            ...params,
            type: params.type as eventtype, 
            location: [locationFound],
            currentParticipants: params.currentParticipants || 0,  
            membersOnly: params.membersOnly || false   
        });

        return await repo.save(newEvenement);
    }

    async listEvenements(filter: ListEvenementFilter): Promise<{ evenements: Evenement[]; totalCount: number; }> {
        const page = filter.page || 1;
        const limit = filter.limit || 10;

        if (isNaN(page) || isNaN(limit)) {
            throw new Error('Page and limit should be numbers');
        }

        const query = this.db.createQueryBuilder(Evenement, 'evenement')
            .leftJoinAndSelect('evenement.location', 'location')
            .where('evenement.isDeleted = :isDeleted', { isDeleted: false })
            .orderBy('evenement.starting', 'DESC')
            .skip((page - 1) * limit)   
            .take(limit);

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
            relations: ['location']
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
            evenementFound.type = params.type as eventtype;
        }

        if (params.description) evenementFound.description = params.description;
        if (params.quorum) evenementFound.quorum = params.quorum;
        if (params.repetitivity) evenementFound.repetitivity = params.repetitivity as repetitivity;
        if (params.isVirtual !== undefined) evenementFound.isVirtual = params.isVirtual;
        if (params.virtualLink !== undefined) evenementFound.virtualLink = params.virtualLink;
        if (params.maxParticipants !== undefined) evenementFound.maxParticipants = params.maxParticipants;

        const { starting, ending } = params;

        if (starting) evenementFound.starting = starting;
        if (ending) evenementFound.ending = ending;

        if (params.location) {
            let locFound = await locationRepo.findOne({ where: { position: params.location } as FindOptionsWhere<Location> });

            if (!locFound) {
                locFound = locationRepo.create({ position: params.location });
                await locationRepo.save(locFound);
            }

            evenementFound.location = [locFound];
        }

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

    async deleteEvenement(id: number): Promise<Evenement | string> {
        const repo = this.db.getRepository(Evenement);
        const evenementFound = await repo.findOne({ where: { id } });
        if (!evenementFound) return "Event not found";
    
        await repo.remove(evenementFound);
        return evenementFound;
    }
}
