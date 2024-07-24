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
exports.MissionUsecase = void 0;
const typeorm_1 = require("typeorm");
const mission_1 = require("../database/entities/mission");
const evenement_1 = require("../database/entities/evenement");
// import { Skill } from "../database/entities/skill";
const user_1 = require("../database/entities/user");
const step_1 = require("../database/entities/step");
const skill_1 = require("../database/entities/skill");
const ressource_1 = require("../database/entities/ressource");
const resourceAvailability_1 = require("../database/entities/resourceAvailability");
class MissionUsecase {
    constructor(db) {
        this.db = db;
    }
    listMissions(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.getRepository(mission_1.Mission)
                .createQueryBuilder('mission')
                .leftJoinAndSelect('mission.requiredSkills', 'skill')
                .leftJoinAndSelect('mission.assignedUsers', 'user')
                .leftJoinAndSelect('mission.evenement', 'evenement')
                .leftJoinAndSelect('mission.step', 'step')
                .leftJoinAndSelect('mission.resources', 'resource')
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [missions, totalCount] = yield query.getManyAndCount();
            const currentDate = new Date();
            for (const mission of missions) {
                if (currentDate > mission.ending) {
                    mission.state = 'ENDED';
                }
                else if (currentDate > mission.starting && currentDate < mission.ending) {
                    mission.state = 'RUNNING';
                }
                else if (currentDate.toDateString() === mission.starting.toDateString()) {
                    mission.state = 'STARTED';
                }
                else {
                    mission.state = 'UNSTARTED';
                }
                yield this.db.getRepository(mission_1.Mission).save(mission);
            }
            return {
                missions,
                totalCount
            };
        });
    }
    isResourceAvailable(resourceId, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceAvailabilityRepository = this.db.getRepository(resourceAvailability_1.ResourceAvailability);
            const overlappingAvailabilities = yield resourceAvailabilityRepository
                .createQueryBuilder("availability")
                .where("availability.resourceId = :resourceId", { resourceId })
                .andWhere("(availability.start < :end AND availability.end > :start)", { start, end })
                .getCount();
            return overlappingAvailabilities === 0;
        });
    }
    createMission(starting, ending, description, eventId, stepId, skills, userEmails, resourceIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const eventRepo = this.db.getRepository(evenement_1.Evenement);
            const stepRepo = this.db.getRepository(step_1.Step);
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const userRepo = this.db.getRepository(user_1.User);
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            let eventFound = null;
            let stepFound = null;
            if (eventId) {
                eventFound = yield eventRepo.findOne({ where: { id: eventId } });
                if (!eventFound) {
                    return "Event not found";
                }
            }
            if (stepId) {
                stepFound = yield stepRepo.findOne({ where: { id: stepId } });
                if (!stepFound) {
                    return "Step not found";
                }
            }
            if (!eventFound && !stepFound) {
                return "Mission must be linked to either an event or a step";
            }
            if (eventFound && (starting < eventFound.starting || ending > eventFound.ending)) {
                return "Mission dates must be within the event's dates";
            }
            if (stepFound && (starting < stepFound.starting || ending > stepFound.ending)) {
                return "Mission dates must be within the step's dates";
            }
            const conflictingMissions = yield missionRepo.createQueryBuilder('mission')
                .where((qb) => {
                if (eventId) {
                    qb.where('mission.evenement = :eventId', { eventId });
                }
                else {
                    qb.where('mission.step = :stepId', { stepId });
                }
            })
                .andWhere(':starting < mission.ending AND :ending > mission.starting', { starting, ending })
                .getMany();
            if (conflictingMissions.length > 0) {
                return "Conflicting mission exists within the same event or step";
            }
            let requiredSkills = [];
            if (skills) {
                requiredSkills = yield Promise.all(skills.map((skillName) => __awaiter(this, void 0, void 0, function* () {
                    let skill = yield skillRepo.findOne({ where: { name: skillName } });
                    if (!skill) {
                        skill = skillRepo.create({ name: skillName });
                        yield skillRepo.save(skill);
                    }
                    return skill;
                })));
            }
            let assignedUsers = [];
            if (userEmails) {
                assignedUsers = yield userRepo.createQueryBuilder('user')
                    .where('user.email IN (:...userEmails)', { userEmails })
                    .getMany();
            }
            let assignedResources = [];
            if (resourceIds) {
                for (const resourceId of resourceIds) {
                    const isAvailable = yield this.isResourceAvailable(resourceId, starting, ending);
                    if (!isAvailable) {
                        return `Resource ${resourceId} is not available for the requested period`;
                    }
                    const resource = yield resourceRepo.findOneBy({ id: resourceId }); // Utiliser findOneBy
                    if (resource) {
                        assignedResources.push(resource);
                    }
                }
            }
            const newMission = missionRepo.create({
                starting,
                ending,
                description,
                state: 'UNSTARTED',
                evenement: eventFound || undefined,
                step: stepFound || undefined,
                requiredSkills,
                assignedUsers,
                resources: assignedResources
            });
            yield missionRepo.save(newMission);
            return newMission;
        });
    }
    getMission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(mission_1.Mission);
            const missionFound = yield repo.findOne({ where: { id } });
            if (!missionFound)
                return null;
            const currentDate = new Date();
            if (currentDate > missionFound.ending) {
                missionFound.state = 'ENDED';
            }
            else if (currentDate > missionFound.starting && currentDate < missionFound.ending) {
                missionFound.state = 'RUNNING';
            }
            else if (currentDate.toDateString() === missionFound.starting.toDateString()) {
                missionFound.state = 'STARTED';
            }
            else {
                missionFound.state = 'UNSTARTED';
            }
            yield repo.save(missionFound); // Optionally save the updated state to the database
            return missionFound;
        });
    }
    updateMission(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(mission_1.Mission);
            const evenementRepo = this.db.getRepository(evenement_1.Evenement);
            const stepRepo = this.db.getRepository(step_1.Step);
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const userRepo = this.db.getRepository(user_1.User);
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const resourceAvailabilityRepo = this.db.getRepository(resourceAvailability_1.ResourceAvailability);
            const missionFound = yield repo.findOne({
                where: { id },
                relations: ['evenement', 'step', 'requiredSkills', 'assignedUsers', 'resources']
            });
            if (!missionFound)
                return "Mission not found";
            const evenement = missionFound.evenement;
            const step = missionFound.step;
            if (!evenement && !step)
                return "Mission must be associated with either an event or a step";
            const newStarting = params.starting || missionFound.starting;
            const newEnding = params.ending || missionFound.ending;
            if (evenement) {
                if (newStarting < evenement.starting || newEnding > evenement.ending) {
                    return "La période de la mission doit être comprise dans celle de l'événement.";
                }
            }
            if (step) {
                if (newStarting < step.starting || newEnding > step.ending) {
                    return "La période de la mission doit être comprise dans celle de l'étape.";
                }
            }
            const conflictingMissions = yield repo.find({
                where: [
                    {
                        evenement: evenement,
                        id: (0, typeorm_1.Not)(id),
                        starting: (0, typeorm_1.LessThanOrEqual)(newEnding),
                        ending: (0, typeorm_1.MoreThanOrEqual)(newStarting),
                    },
                    {
                        step: step,
                        id: (0, typeorm_1.Not)(id),
                        starting: (0, typeorm_1.LessThanOrEqual)(newEnding),
                        ending: (0, typeorm_1.MoreThanOrEqual)(newStarting),
                    }
                ],
            });
            if (conflictingMissions.length > 0) {
                return "Il existe déjà une mission sur cette période.";
            }
            const oldResources = missionFound.resources;
            if (oldResources) {
                for (const resource of oldResources) {
                    yield resourceAvailabilityRepo.delete({ resource: resource, start: missionFound.starting, end: missionFound.ending });
                }
            }
            if (params.starting)
                missionFound.starting = params.starting;
            if (params.ending)
                missionFound.ending = params.ending;
            if (params.description)
                missionFound.description = params.description;
            // Mettre à jour les compétences (skills)
            if (params.skills) {
                missionFound.requiredSkills = yield skillRepo.find({ where: { name: (0, typeorm_1.In)(params.skills) } });
            }
            // Mettre à jour les utilisateurs (users)
            if (params.userEmails) {
                missionFound.assignedUsers = yield userRepo.find({ where: { email: (0, typeorm_1.In)(params.userEmails) } });
            }
            let assignedResources = [];
            if (params.resources) {
                for (const resourceId of params.resources) {
                    const isAvailable = yield this.isResourceAvailable(resourceId, newStarting, newEnding);
                    if (!isAvailable) {
                        return `Resource ${resourceId} is not available for the requested period`;
                    }
                    const resource = yield resourceRepo.findOneBy({ id: resourceId });
                    if (resource) {
                        assignedResources.push(resource);
                    }
                }
                missionFound.resources = assignedResources;
            }
            // Marquer les nouvelles disponibilités des ressources
            if (assignedResources.length > 0) {
                for (const resource of assignedResources) {
                    const availability = resourceAvailabilityRepo.create({
                        resource,
                        start: newStarting,
                        end: newEnding,
                    });
                    yield resourceAvailabilityRepo.save(availability);
                }
            }
            const currentDate = new Date();
            if (currentDate > missionFound.ending) {
                missionFound.state = 'ENDED';
            }
            else if (currentDate > missionFound.starting && currentDate < missionFound.ending) {
                missionFound.state = 'RUNNING';
            }
            else if (currentDate.toDateString() === missionFound.starting.toDateString()) {
                missionFound.state = 'STARTED';
            }
            else {
                missionFound.state = 'UNSTARTED';
            }
            const updatedMission = yield repo.save(missionFound);
            return updatedMission;
        });
    }
    deleteMission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(mission_1.Mission);
            const missionFound = yield repo.findOne({ where: { id } });
            if (!missionFound)
                return false;
            yield repo.remove(missionFound);
            return missionFound;
        });
    }
    addSkillsToMission(missionId, skillIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const mission = yield missionRepo.findOne({ where: { id: missionId }, relations: ['requiredSkills'] });
            if (!mission)
                throw new Error('Mission not found');
            const skills = yield skillRepo.findByIds(skillIds);
            mission.requiredSkills = skills;
            yield missionRepo.save(mission);
            return mission;
        });
    }
    assignUsersToMission(missionId, userEmails) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const userRepo = this.db.getRepository(user_1.User);
            const mission = yield missionRepo.findOne({
                where: { id: missionId },
                relations: ['assignedUsers', 'requiredSkills']
            });
            if (!mission) {
                return "Mission not found";
            }
            const users = yield userRepo.createQueryBuilder('user')
                .leftJoinAndSelect('user.skills', 'skill')
                .where('user.email IN (:...userEmails)', { userEmails })
                .getMany();
            const requiredSkillNames = mission.requiredSkills.map(skill => skill.name);
            const compatibleUsers = users.filter(user => user.skills.some(skill => requiredSkillNames.includes(skill.name)));
            if (compatibleUsers.length !== users.length) {
                return "Some users do not have the required skills for this mission";
            }
            mission.assignedUsers = compatibleUsers;
            yield missionRepo.save(mission);
            return mission;
        });
    }
    getUsersByMissionSkills(missionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const userRepo = this.db.getRepository(user_1.User);
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const mission = yield missionRepo.findOne({ where: { id: missionId }, relations: ["requiredSkills"] });
            if (!mission)
                throw new Error('Mission not found');
            const users = yield userRepo.createQueryBuilder('user')
                .leftJoinAndSelect('user.skills', 'skill')
                .where('user.status = :status', { status: 'NORMAL' })
                .andWhere('skill.id IN (:...skillIds)', { skillIds: mission.requiredSkills.map(skill => skill.id) })
                .getMany();
            return users;
        });
    }
    getMissionsByStep(stepId) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const missions = yield missionRepo.find({ where: { step: { id: stepId } }, relations: ["step"] });
            return missions;
        });
    }
    getMissionsByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const missions = yield missionRepo.find({ where: { evenement: { id: eventId } }, relations: ["evenement"] });
            return missions;
        });
    }
}
exports.MissionUsecase = MissionUsecase;
