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
exports.ResourceUsecase = void 0;
const typeorm_1 = require("typeorm");
const ressource_1 = require("../database/entities/ressource");
const mission_1 = require("../database/entities/mission");
const resourceAvailability_1 = require("../database/entities/resourceAvailability");
class ResourceUsecase {
    constructor(db) {
        this.db = db;
    }
    updateResource(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const resource = yield resourceRepo.findOne({ where: { id } });
            if (!resource) {
                return null;
            }
            Object.assign(resource, updateData);
            yield resourceRepo.save(resource);
            return resource;
        });
    }
    createResource(name_1, type_1) {
        return __awaiter(this, arguments, void 0, function* (name, type, isAvailable = true) {
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const newResource = resourceRepo.create({ name, type, isAvailable });
            yield resourceRepo.save(newResource);
            return newResource;
        });
    }
    assignResourcesToMission(missionId, resourceIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const mission = yield missionRepo.findOne({ where: { id: missionId }, relations: ['resources'] });
            if (!mission)
                return "Mission not found";
            const resources = yield resourceRepo.findByIds(resourceIds);
            if (resources.length !== resourceIds.length)
                return "One or more resources not found";
            for (const resource of resources) {
                if (!resource.isAvailable) {
                    return `Resource ${resource.name} is not available`;
                }
                resource.isAvailable = false;
            }
            mission.resources.push(...resources);
            yield resourceRepo.save(resources);
            yield missionRepo.save(mission);
            return mission;
        });
    }
    releaseResourcesFromMission(missionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const mission = yield missionRepo.findOne({ where: { id: missionId }, relations: ['resources'] });
            if (!mission)
                return "Mission not found";
            mission.resources.forEach(resource => {
                resource.isAvailable = true;
            });
            yield resourceRepo.save(mission.resources);
            mission.resources = [];
            yield missionRepo.save(mission);
            return mission;
        });
    }
    getAvailableResources() {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            return yield resourceRepo.find({ where: { isAvailable: true } });
        });
    }
    getResourcesByMission(missionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const mission = yield missionRepo.findOne({ where: { id: missionId }, relations: ['resources'] });
            if (!mission)
                throw new Error('Mission not found');
            return mission.resources;
        });
    }
    cleanUpExpiredAvailabilities() {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceAvailabilityRepo = this.db.getRepository(resourceAvailability_1.ResourceAvailability);
            const currentDate = new Date();
            yield resourceAvailabilityRepo.delete({
                end: (0, typeorm_1.LessThanOrEqual)(currentDate),
            });
        });
    }
    deleteResource(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const resource = yield resourceRepo.findOne({ where: { id } });
            if (!resource) {
                return false;
            }
            yield resourceRepo.remove(resource);
            return true;
        });
    }
    getAllResources() {
        return __awaiter(this, void 0, void 0, function* () {
            const resourceRepo = this.db.getRepository(ressource_1.Resource);
            const missions = yield this.db.getRepository(mission_1.Mission).find({ relations: ['resources'] });
            const currentDate = new Date();
            for (const mission of missions) {
                for (const resource of mission.resources) {
                    if (currentDate > mission.ending && resource.isAvailable === false) {
                        resource.isAvailable = true;
                        yield resourceRepo.save(resource);
                    }
                }
            }
            return yield resourceRepo.find();
        });
    }
}
exports.ResourceUsecase = ResourceUsecase;
