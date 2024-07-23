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
exports.ProjetUsecase = void 0;
const projet_1 = require("../database/entities/projet");
const user_1 = require("../database/entities/user");
class ProjetUsecase {
    constructor(db) {
        this.db = db;
    }
    listProjets(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(projet_1.Projet, 'projet')
                .leftJoinAndSelect('projet.steps', 'step')
                .where('projet.isDeleted = :isDeleted', { isDeleted: false })
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [projets, totalCount] = yield query.getManyAndCount();
            const currentDate = new Date();
            projets.forEach((projet) => __awaiter(this, void 0, void 0, function* () {
                if (currentDate > projet.ending) {
                    projet.state = 'ENDED';
                }
                else if (currentDate > projet.starting && currentDate < projet.ending) {
                    projet.state = 'RUNNING';
                }
                else if (currentDate.toDateString() === projet.starting.toDateString()) {
                    projet.state = 'STARTED';
                }
                else {
                    projet.state = 'UNSTARTED';
                }
                yield this.db.getRepository(projet_1.Projet).save(projet);
            }));
            return {
                projets,
                totalCount
            };
        });
    }
    createProjet(project) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const projetRepo = this.db.getRepository(projet_1.Projet);
            // Chercher l'utilisateur par ID
            const userFound = yield userRepo.findOne({ where: { id: project.userId, isDeleted: false } });
            if (!userFound) {
                return "User not found";
            }
            // Déterminer l'état initial basé sur les dates
            const currentDate = new Date();
            let state = 'UNSTARTED';
            if (currentDate > project.ending) {
                state = 'ENDED';
            }
            else if (currentDate > project.starting && currentDate < project.ending) {
                state = 'RUNNING';
            }
            else if (currentDate.toDateString() === new Date(project.starting).toDateString()) {
                state = 'STARTED';
            }
            // Créer le projet
            const newProjet = projetRepo.create({
                description: project.description,
                starting: project.starting,
                ending: project.ending,
                user: userFound,
                state: state
            });
            // Sauvegarder le projet
            yield projetRepo.save(newProjet);
            return newProjet;
        });
    }
    getProjet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(projet_1.Projet);
            const projetFound = yield repo.findOne({ where: { id, isDeleted: false } });
            return projetFound || null;
        });
    }
    getAllProjet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(projet_1.Projet);
            const projetFound = yield repo.findOne({ where: { id } });
            return projetFound || null;
        });
    }
    updateProjet(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(projet_1.Projet);
            const projetFound = yield repo.findOne({ where: { id, isDeleted: false } });
            if (!projetFound)
                return null;
            let newStarting = params.starting || projetFound.starting;
            let newEnding = params.ending || projetFound.ending;
            // Rechercher les projets chevauchants
            const overlappingProjects = yield repo.createQueryBuilder("projet")
                .where("projet.id != :id", { id })
                .andWhere("projet.isDeleted = :isDeleted", { isDeleted: false })
                .andWhere("projet.starting < :newEnding", { newEnding })
                .andWhere("projet.ending > :newStarting", { newStarting })
                .getMany();
            if (overlappingProjects.length > 0) {
                return 'Les nouvelles dates chevauchent un autre projet';
            }
            if (params.description)
                projetFound.description = params.description;
            if (params.starting)
                projetFound.starting = params.starting;
            if (params.ending)
                projetFound.ending = params.ending;
            // Mettre à jour l'état en fonction des nouvelles dates
            const currentDate = new Date();
            if (currentDate > newEnding) {
                projetFound.state = 'ENDED';
            }
            else if (currentDate > newStarting && currentDate < newEnding) {
                projetFound.state = 'RUNNING';
            }
            else if (currentDate.toDateString() === new Date(newStarting).toDateString()) {
                projetFound.state = 'STARTED';
            }
            else {
                projetFound.state = 'UNSTARTED';
            }
            const updatedProjet = yield repo.save(projetFound);
            return updatedProjet;
        });
    }
    deleteProjet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(projet_1.Projet);
            const projetFound = yield repo.findOne({ where: { id, isDeleted: false } });
            if (!projetFound)
                return false;
            projetFound.isDeleted = true;
            yield repo.save(projetFound);
            return projetFound;
        });
    }
}
exports.ProjetUsecase = ProjetUsecase;
