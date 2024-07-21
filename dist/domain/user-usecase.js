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
exports.UserUsecase = void 0;
const user_1 = require("../database/entities/user");
const status_1 = require("../database/entities/status");
const bcrypt_1 = require("bcrypt");
const skill_1 = require("../database/entities/skill");
class UserUsecase {
    constructor(db) {
        this.db = db;
    }
    updateUser(id, userToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({
                where: { id, isDeleted: false },
                relations: ['status']
            });
            if (!userFound) {
                return "User not Found !!!";
            }
            if (userFound.status && userFound.status.description != "NORMAL") {
                return "This is not a commonn user !!!";
            }
            // Vérifier si le mot de passe actuel est correct
            const isValid = yield (0, bcrypt_1.compare)(userToUpdate.actual_password, userFound.password);
            if (!isValid) {
                return "Actual password incorrect !!!";
            }
            // Si le mot de passe actuel est correct, effectuer les modifications
            if (userToUpdate.email) {
                userFound.email = userToUpdate.email;
            }
            if (userToUpdate.name) {
                userFound.name = userToUpdate.name;
            }
            // if (userToUpdate.iban) {
            //   userFound.iban = userToUpdate.iban;
            // }
            if (userToUpdate.password) {
                userFound.password = yield (0, bcrypt_1.hash)(userToUpdate.password, 10);
            }
            const uUpdated = yield userRepo.save(userFound);
            return uUpdated;
        });
    }
    updateAdmin(id, userToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({
                where: { id, isDeleted: false },
                relations: ['status']
            });
            if (!userFound) {
                return "User not Found !!!";
            }
            if (userFound.status && userFound.status.description != "ADMIN") {
                return "This is not an admin !!!";
            }
            // Vérifier si le mot de passe actuel est correct
            const isValid = yield (0, bcrypt_1.compare)(userToUpdate.actual_password, userFound.password);
            if (!isValid) {
                return "Actual password incorrect !!!";
            }
            // Si le mot de passe actuel est correct, effectuer les modifications
            if (userToUpdate.email) {
                userFound.email = userToUpdate.email;
            }
            //if (userToUpdate.iban) {
            //userFound.iban = userToUpdate.iban;
            //}
            if (userToUpdate.password) {
                userFound.password = yield (0, bcrypt_1.hash)(userToUpdate.password, 10);
            }
            const uUpdated = yield userRepo.save(userFound);
            return uUpdated;
        });
    }
    updateBenefactor(id, userToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({
                where: { id, isDeleted: false },
                relations: ['status']
            });
            if (!userFound) {
                return "User not Found !!!";
            }
            if (userFound.status && userFound.status.description != "BENEFACTOR") {
                return "This is not a benefactor !!!";
            }
            // Vérifier si le mot de passe actuel est correct
            const isValid = yield (0, bcrypt_1.compare)(userToUpdate.actual_password, userFound.password);
            if (!isValid) {
                return "Actual password incorrect !!!";
            }
            // Si le mot de passe actuel est correct, effectuer les modifications
            if (userToUpdate.email) {
                userFound.email = userToUpdate.email;
            }
            if (userToUpdate.name) {
                userFound.name = userToUpdate.name;
            }
            // if (userToUpdate.iban) {
            //   userFound.iban = userToUpdate.iban;
            // }
            if (userToUpdate.password) {
                userFound.password = yield (0, bcrypt_1.hash)(userToUpdate.password, 10);
            }
            const uUpdated = yield userRepo.save(userFound);
            return uUpdated;
        });
    }
    listUser(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(filter);
            const query = this.db.getRepository(user_1.User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.status', 'status')
                .leftJoinAndSelect('user.skills', 'skill')
                .where('user.isDeleted = :isDeleted', { isDeleted: false });
            if (filter.type) {
                const status = yield this.db.getRepository(status_1.Status)
                    .createQueryBuilder('status')
                    .where('status.description = :description', { description: filter.type })
                    .getOne();
                if (status) {
                    query.andWhere('user.status.id = :statusId', { statusId: status.id });
                }
                else {
                    return `Nothing Found !!! from type: ${filter.type}`;
                }
            }
            if (filter.skills && filter.skills.length > 0) {
                query.andWhere('skill.name IN (:...skills)', { skills: filter.skills });
            }
            query.skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [users, totalCount] = yield query.getManyAndCount();
            return {
                users,
                totalCount
            };
        });
    }
    getUsersByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.db.getRepository(user_1.User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.status', 'status')
                .where('status.description = NORMAL')
                .andWhere('user.isDeleted = false')
                .select('user.email')
                .getMany();
            return users.map(user => user.email);
        });
    }
    addSkillToUser(userId, skillName) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const userFound = yield userRepo.findOne({ where: { id: userId, isDeleted: false }, relations: ['skills'] });
            if (!userFound) {
                return "User not found";
            }
            let skillFound = yield skillRepo.findOne({ where: { name: skillName } });
            if (!skillFound) {
                skillFound = skillRepo.create({ name: skillName });
                yield skillRepo.save(skillFound);
            }
            userFound.skills.push(skillFound);
            yield userRepo.save(userFound);
            return userFound;
        });
    }
    getUsersByStatus(statusDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.db.getRepository(status_1.Status)
                .createQueryBuilder('status')
                .where('status.description = :description', { description: statusDescription })
                .getOne();
            if (!status) {
                throw new Error(`Status with description ${statusDescription} not found`);
            }
            const users = yield this.db.getRepository(user_1.User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.status', 'status')
                .where('user.status.id = :statusId', { statusId: status.id })
                .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
                .getMany();
            return users;
        });
    }
}
exports.UserUsecase = UserUsecase;
