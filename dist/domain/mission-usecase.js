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
const skill_1 = require("../database/entities/skill");
const user_1 = require("../database/entities/user");
const ressource_1 = require("../database/entities/ressource");
class MissionUsecase {
    constructor(db) {
        this.db = db;
    }
    // CREATE a new mission
    createMission(starting, ending, description, skills, userEmails, resourceIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const userRepo = this.db.getRepository(user_1.User);
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
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
                for (const email of userEmails) {
                    const user = yield userRepo.findOne({ where: { email } });
                    if (user) {
                        user.isAvailable = false;
                        yield userRepo.save(user);
                        assignedUsers.push(user);
                    }
                }
            }
            let assignedResources = [];
            if (resourceIds && resourceIds.length > 0) {
                const resources = yield Promise.all(resourceIds.map((resourceId) => __awaiter(this, void 0, void 0, function* () {
                    const resource = yield resourceRepo.findOne({ where: { id: resourceId } });
                    if (resource) {
                        resource.isAvailable = false;
                        yield resourceRepo.save(resource);
                        return resource;
                    }
                    return null; // Retourne null si la ressource n'est pas trouvée
                })));
                assignedResources = resources.filter((resource) => resource !== null);
                console.log("Assigned Resources after filter:", assignedResources);
            }
            console.log("Final Resources to be saved in mission:", assignedResources);
            const newMission = missionRepo.create({
                starting,
                ending,
                description,
                state: 'UNSTARTED',
                requiredSkills,
                assignedUsers,
                resources: assignedResources
            });
            yield missionRepo.save(newMission);
            return newMission;
        });
    }
    // READ/List missions
    listMissions(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.getRepository(mission_1.Mission)
                .createQueryBuilder('mission')
                .leftJoinAndSelect('mission.requiredSkills', 'skill')
                .leftJoinAndSelect('mission.assignedUsers', 'user')
                .leftJoinAndSelect('mission.resources', 'resource')
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [missions, totalCount] = yield query.getManyAndCount();
            const currentDate = new Date();
            for (const mission of missions) {
                if (currentDate > mission.ending) {
                    mission.state = 'ENDED';
                    // Libérer les utilisateurs et les ressources si la mission est terminée
                    if (mission.assignedUsers) {
                        for (const user of mission.assignedUsers) {
                            user.isAvailable = true;
                            yield this.db.getRepository(user_1.User).save(user);
                        }
                    }
                    if (mission.resources) {
                        for (const resource of mission.resources) {
                            resource.isAvailable = true;
                            yield this.db.getRepository(ressource_1.Resource).save(resource);
                        }
                    }
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
    // READ/Find one mission by id
    getMission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(mission_1.Mission);
            const missionFound = yield repo.findOne({ where: { id }, relations: ['requiredSkills', 'assignedUsers', 'resources'] });
            if (!missionFound)
                return null;
            const currentDate = new Date();
            if (currentDate > missionFound.ending) {
                missionFound.state = 'ENDED';
                // Libérer les utilisateurs et les ressources si la mission est terminée
                if (Array.isArray(missionFound.assignedUsers)) {
                    for (const user of missionFound.assignedUsers) {
                        user.isAvailable = true;
                        yield this.db.getRepository(user_1.User).save(user);
                    }
                }
                if (Array.isArray(missionFound.resources)) {
                    for (const resource of missionFound.resources) {
                        resource.isAvailable = true;
                        yield this.db.getRepository(ressource_1.Resource).save(resource);
                    }
                }
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
            yield repo.save(missionFound); // Save the updated state and availability to the database
            return missionFound;
        });
    }
    // UPDATE a mission
    updateMission(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(mission_1.Mission);
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const userRepo = this.db.getRepository(user_1.User);
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const missionFound = yield repo.findOne({
                where: { id },
                relations: ['requiredSkills', 'assignedUsers', 'resources']
            });
            if (!missionFound)
                return "Mission not found";
            // Libérer les anciennes ressources et utilisateurs
            const oldResources = missionFound.resources;
            if (oldResources) {
                for (const resource of oldResources) {
                    resource.isAvailable = true;
                    yield resourceRepo.save(resource);
                }
            }
            const oldUsers = missionFound.assignedUsers;
            if (oldUsers) {
                for (const user of oldUsers) {
                    user.isAvailable = true;
                    yield userRepo.save(user);
                }
            }
            // Mettre à jour la mission
            if (params.starting)
                missionFound.starting = params.starting;
            if (params.ending)
                missionFound.ending = params.ending;
            if (params.description)
                missionFound.description = params.description;
            // Réinitialiser les compétences si un tableau vide est fourni
            if (Array.isArray(params.skills)) {
                missionFound.requiredSkills = [];
            }
            if (params.skills && params.skills.length > 0) {
                missionFound.requiredSkills = yield skillRepo.find({ where: { name: (0, typeorm_1.In)(params.skills) } });
            }
            if (Array.isArray(params.userEmails)) {
                missionFound.assignedUsers = [];
            }
            // Mettre à jour les utilisateurs (users) si des valeurs sont fournies
            if (params.userEmails && params.userEmails.length > 0) {
                const assignedUsers = [];
                for (const email of params.userEmails) {
                    const user = yield userRepo.findOne({ where: { email } });
                    if (user) {
                        user.isAvailable = false;
                        yield userRepo.save(user);
                        assignedUsers.push(user);
                    }
                }
                missionFound.assignedUsers = assignedUsers;
            }
            // Réinitialiser les ressources si un tableau vide est fourni
            if (Array.isArray(params.resources)) {
                missionFound.resources = [];
            }
            // Assigner les nouvelles ressources
            if (params.resources && params.resources.length > 0) {
                const assignedResources = [];
                for (const resourceId of params.resources) {
                    const resource = yield resourceRepo.findOne({ where: { id: resourceId } });
                    if (resource) {
                        resource.isAvailable = false;
                        yield resourceRepo.save(resource);
                        assignedResources.push(resource);
                    }
                }
                missionFound.resources = assignedResources;
            }
            // Mettre à jour l'état en fonction des nouvelles dates
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
    // DELETE a mission
    deleteMission(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(mission_1.Mission);
            const userRepo = this.db.getRepository(user_1.User);
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const missionFound = yield repo.findOne({
                where: { id },
                relations: ['assignedUsers', 'resources']
            });
            if (!missionFound)
                return "Mission not found";
            const currentDate = new Date();
            if (currentDate < missionFound.ending) {
                // La mission est en cours ou à venir, libérer les utilisateurs et les ressources
                if (Array.isArray(missionFound.assignedUsers)) {
                    for (const user of missionFound.assignedUsers) {
                        user.isAvailable = true;
                        yield this.db.getRepository(user_1.User).save(user);
                    }
                }
                if (Array.isArray(missionFound.resources)) {
                    for (const resource of missionFound.resources) {
                        resource.isAvailable = true;
                        yield this.db.getRepository(ressource_1.Resource).save(resource);
                    }
                }
            }
            // Supprimer définitivement la mission
            yield repo.remove(missionFound);
            return missionFound;
        });
    }
}
exports.MissionUsecase = MissionUsecase;
