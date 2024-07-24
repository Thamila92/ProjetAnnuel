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
exports.StepUsecase = void 0;
const step_1 = require("../database/entities/step");
const projet_1 = require("../database/entities/projet");
const mission_1 = require("../database/entities/mission");
class StepUsecase {
    constructor(db) {
        this.db = db;
    }
    listSteps(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(step_1.Step, 'step')
                .leftJoinAndSelect("step.projet", "projet")
                .leftJoinAndSelect("step.mission", "mission")
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [steps, totalCount] = yield query.getManyAndCount();
            const currentDate = new Date();
            steps.forEach(step => {
                if (currentDate > step.ending) {
                    step.state = 'ENDED';
                }
                else if (currentDate > step.starting && currentDate < step.ending) {
                    step.state = 'RUNNING';
                }
                else if (currentDate.toDateString() === step.starting.toDateString()) {
                    step.state = 'STARTED';
                }
            });
            yield this.db.getRepository(step_1.Step).save(steps);
            return {
                steps,
                totalCount
            };
        });
    }
    createStep(state, description, starting, ending, projetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const projetRepo = this.db.getRepository(projet_1.Projet);
            const projet = yield projetRepo.findOne({ where: { id: projetId } });
            if (!projet) {
                throw new Error('Projet not found');
            }
            // Vérification que les dates de l'étape sont encadrées par celles du projet
            if (new Date(starting) < new Date(projet.starting) || new Date(ending) > new Date(projet.ending)) {
                throw new Error('Step dates must be within the project dates');
            }
            const stepRepo = this.db.getRepository(step_1.Step);
            // Vérification des chevauchements d'étapes pour le même projet
            const overlappingSteps = yield stepRepo.createQueryBuilder("step")
                .where("step.projetId = :projetId", { projetId })
                .andWhere("step.starting < :ending AND step.ending > :starting", { starting, ending })
                .getCount();
            if (overlappingSteps > 0) {
                throw new Error('There is already a step planned for the same project during this period');
            }
            const newStep = stepRepo.create({ state, description, starting, ending, projet });
            yield stepRepo.save(newStep);
            return newStep;
        });
    }
    getStep(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(step_1.Step);
            const stepFound = yield repo.findOne({ where: { id }, relations: ["projet", "missions"] });
            if (!stepFound)
                return null;
            const currentDate = new Date();
            if (currentDate > stepFound.ending) {
                stepFound.state = 'ENDED';
            }
            else if (currentDate > stepFound.starting && currentDate < stepFound.ending) {
                stepFound.state = 'RUNNING';
            }
            else if (currentDate.toDateString() === stepFound.starting.toDateString()) {
                stepFound.state = 'STARTED';
            }
            // Optionally, save the updated state back to the database
            yield repo.save(stepFound);
            return stepFound;
        });
    }
    updateStep(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(step_1.Step);
            const stepFound = yield repo.findOne({ where: { id }, relations: ["projet", "missions"] });
            if (!stepFound)
                return null;
            if (params.projetId && params.projetId !== stepFound.projet.id) {
                const projetRepo = this.db.getRepository(projet_1.Projet);
                const projet = yield projetRepo.findOne({ where: { id: params.projetId } });
                if (!projet) {
                    throw new Error('Projet not found');
                }
                stepFound.projet = projet;
            }
            if (params.state)
                stepFound.state = params.state;
            if (params.description)
                stepFound.description = params.description;
            if (params.starting)
                stepFound.starting = params.starting;
            if (params.ending)
                stepFound.ending = params.ending;
            const projet = stepFound.projet;
            if (stepFound.starting < projet.starting || stepFound.ending > projet.ending) {
                throw new Error('Step dates must be within the project dates');
            }
            const overlappingSteps = yield repo.createQueryBuilder("step")
                .where("step.projetId = :projetId", { projetId: projet.id })
                .andWhere("step.id != :id", { id })
                .andWhere("step.starting < :ending AND step.ending > :starting", { starting: stepFound.starting, ending: stepFound.ending })
                .getCount();
            if (overlappingSteps > 0) {
                throw new Error('There is already a step planned for the same project during this period');
            }
            if (params.missionIds) {
                const missionRepo = this.db.getRepository(mission_1.Mission);
                const missions = yield missionRepo.findByIds(params.missionIds);
                stepFound.missions = missions;
            }
            const updatedStep = yield repo.save(stepFound);
            return updatedStep;
        });
    }
    deleteStep(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(step_1.Step);
            const stepFound = yield repo.findOne({ where: { id } });
            if (!stepFound)
                return false;
            yield repo.remove(stepFound);
            return true;
        });
    }
}
exports.StepUsecase = StepUsecase;
