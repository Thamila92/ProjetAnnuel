"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvenementUsecase = void 0;
const evenement_1 = require("../database/entities/evenement");
const event_types_1 = require("../types/event-types");
const location_1 = require("../database/entities/location");
class EvenementUsecase {
    constructor(db) {
        this.db = db;
    }
    listEvenements(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(evenement_1.Evenement, 'evenement')
                .leftJoinAndSelect('evenement.location', 'location')
                .where('evenement.isDeleted = :isDeleted', { isDeleted: false })
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [evenements, totalCount] = yield query.getManyAndCount();
            return {
                evenements,
                totalCount
            };
        });
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
    getEvenement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(evenement_1.Evenement);
            const evenementFound = yield repo.findOne({
                where: { id, isDeleted: false },
                relations: ['location'] // Inclure la relation location
            });
            return evenementFound || null;
        });
    }
    updateEvenement(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(evenement_1.Evenement);
            const evenementFound = yield repo.findOne({ where: { id, isDeleted: false }, relations: ["location"] });
            if (!evenementFound)
                return null;
            if (params.type === "AG" && !params.quorum) {
                return "You must specify the Quorum";
            }
            if (params.type) {
                const isValidEventType = Object.values(event_types_1.eventtype).includes(params.type);
                if (!isValidEventType) {
                    return "Invalid event type";
                }
                evenementFound.typee = params.type;
            }
            if (params.description)
                evenementFound.description = params.description;
            if (params.quorum)
                evenementFound.quorum = params.quorum;
            if (params.repetitivity)
                evenementFound.repetitivity = params.repetitivity;
            if (params.isVirtual !== undefined)
                evenementFound.isVirtual = params.isVirtual;
            if (params.virtualLink !== undefined)
                evenementFound.virtualLink = params.virtualLink;
            const { starting, ending } = params;
            if (starting || ending) {
                const checkStarting = starting || evenementFound.starting;
                const checkEnding = ending || evenementFound.ending;
                const conflictingEvents = yield repo.createQueryBuilder('event')
                    .where(':starting < event.ending AND :ending > event.starting', { starting: checkStarting, ending: checkEnding })
                    .andWhere('event.id != :id', { id })
                    .andWhere('event.isDeleted = false')
                    .getMany();
                if (conflictingEvents.length > 0) {
                    return "Conflicting event exists";
                }
                if (starting)
                    evenementFound.starting = starting;
                if (ending)
                    evenementFound.ending = ending;
            }
            if (params.location) {
                const locationRepo = this.db.getRepository(location_1.Location);
                let locFound = yield locationRepo.findOne({ where: { position: params.location } });
                if (!locFound) {
                    locFound = locationRepo.create({ position: params.location });
                    yield locationRepo.save(locFound);
                }
                evenementFound.location = [locFound];
            }
            const updatedEvenement = yield repo.save(evenementFound);
            return updatedEvenement;
        });
    }
    deleteEvenement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(evenement_1.Evenement);
            const evenementFound = yield repo.findOne({ where: { id, isDeleted: false } });
            if (!evenementFound)
                return "Event not found";
            evenementFound.isDeleted = true;
            yield repo.save(evenementFound);
            return evenementFound;
        });
    }
}
exports.EvenementUsecase = EvenementUsecase;
