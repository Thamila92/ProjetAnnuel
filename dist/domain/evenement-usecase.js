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
const evenementAttendee_1 = require("../database/entities/evenementAttendee");
const user_1 = require("../database/entities/user");
class EvenementUsecase {
    constructor(db) {
        this.db = db;
    }
    createEvenement(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(evenement_1.Evenement);
            const locationRepo = this.db.getRepository(location_1.Location);
            let locationFound = yield locationRepo.findOne({ where: { position: params.location } });
            if (!locationFound) {
                locationFound = locationRepo.create({ position: params.location });
                yield locationRepo.save(locationFound);
            }
            const newEvenement = repo.create(Object.assign(Object.assign({}, params), { type: params.type, location: [locationFound], currentParticipants: params.currentParticipants || 0, membersOnly: params.membersOnly || false }));
            return yield repo.save(newEvenement);
        });
    }
    listEvenements(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = filter.page || 1;
            const limit = filter.limit || 10;
            if (isNaN(page) || isNaN(limit)) {
                throw new Error('Page and limit should be numbers');
            }
            const query = this.db.createQueryBuilder(evenement_1.Evenement, 'evenement')
                .leftJoinAndSelect('evenement.location', 'location')
                .where('evenement.isDeleted = :isDeleted', { isDeleted: false })
                .orderBy('evenement.starting', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            const [evenements, totalCount] = yield query.getManyAndCount();
            const currentDate = new Date();
            for (const evenement of evenements) {
                if (currentDate > evenement.ending) {
                    evenement.state = 'ENDED';
                }
                else if (currentDate > evenement.starting && currentDate < evenement.ending) {
                    evenement.state = 'RUNNING';
                }
                else if (currentDate.toDateString() === evenement.starting.toDateString()) {
                    evenement.state = 'STARTED';
                }
                else {
                    evenement.state = 'UNSTARTED';
                }
                yield this.db.getRepository(evenement_1.Evenement).save(evenement);
            }
            return {
                evenements,
                totalCount
            };
        });
    }
    getEvenement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(evenement_1.Evenement);
            const evenementFound = yield repo.findOne({
                where: { id, isDeleted: false },
                relations: ['location']
            });
            return evenementFound || null;
        });
    }
    updateEvenement(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(evenement_1.Evenement);
            const locationRepo = this.db.getRepository(location_1.Location);
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
                evenementFound.type = params.type;
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
            if (params.maxParticipants !== undefined)
                evenementFound.maxParticipants = params.maxParticipants;
            const { starting, ending } = params;
            if (starting)
                evenementFound.starting = starting;
            if (ending)
                evenementFound.ending = ending;
            if (params.location) {
                let locFound = yield locationRepo.findOne({ where: { position: params.location } });
                if (!locFound) {
                    locFound = locationRepo.create({ position: params.location });
                    yield locationRepo.save(locFound);
                }
                evenementFound.location = [locFound];
            }
            const currentDate = new Date();
            if (currentDate > evenementFound.ending) {
                evenementFound.state = 'ENDED';
            }
            else if (currentDate > evenementFound.starting && currentDate < evenementFound.ending) {
                evenementFound.state = 'RUNNING';
            }
            else if (currentDate.toDateString() === evenementFound.starting.toDateString()) {
                evenementFound.state = 'STARTED';
            }
            else {
                evenementFound.state = 'UNSTARTED';
            }
            const updatedEvenement = yield repo.save(evenementFound);
            return updatedEvenement;
        });
    }
    deleteEvenement(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(evenement_1.Evenement);
            const evenementFound = yield repo.findOne({ where: { id } });
            if (!evenementFound)
                return "Event not found";
            yield repo.remove(evenementFound);
            return evenementFound;
        });
    }
    registerForEvent(evenementId, attendeeInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const evenementRepo = this.db.getRepository(evenement_1.Evenement);
            const attendeeRepo = this.db.getRepository(evenementAttendee_1.EvenementAttendee);
            const userRepo = this.db.getRepository(user_1.User);
            // Récupérer l'événement
            const evenement = yield evenementRepo.findOne({ where: { id: evenementId, isDeleted: false }, relations: ["attendees"] });
            if (!evenement) {
                return "Event not found";
            }
            // Vérifier si un utilisateur avec le même email et nom existe déjà
            const existingUser = yield userRepo.findOne({ where: { email: attendeeInfo.email } });
            // Vérifier si l'événement a atteint le nombre maximum de participants
            if (evenement.currentParticipants >= evenement.maxParticipants) {
                return "The event has reached its maximum number of participants";
            }
            const existingAttendee = yield attendeeRepo.findOne({ where: { email: attendeeInfo.email, evenement: evenement } });
            if (existingAttendee) {
                return "You are already registered for this event.";
            }
            // Créer un nouveau participant (attendee)
            const newAttendee = attendeeRepo.create({
                firstName: attendeeInfo.firstName,
                lastName: attendeeInfo.lastName,
                email: attendeeInfo.email,
                age: attendeeInfo.age,
                evenement: evenement,
                user: existingUser || undefined // Associer à l'utilisateur existant ou laisser vide
            });
            // Sauvegarder le nouvel participant dans la base de données
            yield attendeeRepo.save(newAttendee);
            // Incrémenter le nombre de participants de l'événement
            evenement.currentParticipants += 1;
            yield evenementRepo.save(evenement);
            return newAttendee;
        });
    }
    getAllEvenementAttendees() {
        return __awaiter(this, void 0, void 0, function* () {
            const attendeeRepo = this.db.getRepository(evenementAttendee_1.EvenementAttendee);
            // Requête pour récupérer tous les EvenementAttendee
            const allAttendees = yield attendeeRepo.find({
                relations: ["evenement", "user"] // Relations pour inclure les informations sur l'événement et les utilisateurs
            });
            return allAttendees;
        });
    }
    cancelEventRegistration(attendeeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const attendeeRepo = this.db.getRepository(evenementAttendee_1.EvenementAttendee);
            const evenementRepo = this.db.getRepository(evenement_1.Evenement);
            // Trouver l'enregistrement du participant
            const attendee = yield attendeeRepo.findOne({ where: { id: attendeeId }, relations: ['evenement'] });
            if (!attendee) {
                return "Reservation not found";
            }
            // Récupérer l'événement lié à la réservation
            const evenement = attendee.evenement;
            if (evenement) {
                // Décrémenter le nombre de participants si supérieur à 0
                if (evenement.currentParticipants > 0) {
                    evenement.currentParticipants -= 1;
                    yield evenementRepo.save(evenement);
                }
            }
            // Supprimer l'enregistrement du participant
            yield attendeeRepo.remove(attendee);
            return "Reservation canceled successfully";
        });
    }
}
exports.EvenementUsecase = EvenementUsecase;
