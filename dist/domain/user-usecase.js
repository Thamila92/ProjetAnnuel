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
const mission_1 = require("../database/entities/mission");
const jsonwebtoken_1 = require("jsonwebtoken");
class UserUsecase {
    constructor(db) {
        this.db = db;
    }
    // Créer un Adhérent
    createAdherent(createAdherentRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = this.db.getRepository(user_1.User);
                const status = yield this.db.getRepository(status_1.Status)
                    .createQueryBuilder("status")
                    .where("status.type = :status", { status: "MEMBER" })
                    .getOne();
                if (!status) {
                    return "Status MEMBER not found";
                }
                const hashedPassword = yield (0, bcrypt_1.hash)(createAdherentRequest.password, 10);
                let skills = [];
                if (createAdherentRequest.skills && createAdherentRequest.skills.length > 0) {
                    const skillRepo = this.db.getRepository(skill_1.Skill);
                    skills = yield Promise.all(createAdherentRequest.skills.map((skillName) => __awaiter(this, void 0, void 0, function* () {
                        let skill = yield skillRepo.findOne({ where: { name: skillName } });
                        if (!skill) {
                            skill = skillRepo.create({ name: skillName });
                            yield skillRepo.save(skill);
                        }
                        return skill;
                    })));
                }
                const newUser = userRepository.create({
                    name: createAdherentRequest.name,
                    email: createAdherentRequest.email,
                    password: hashedPassword,
                    status: status,
                    skills: skills
                });
                const savedUser = yield userRepository.save(newUser);
                return savedUser;
            }
            catch (error) {
                console.error(error);
                return "Internal error, please try again later";
            }
        });
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userRepo = this.db.getRepository(user_1.User);
            const user = yield userRepo.findOne({ where: { email, isDeleted: false }, relations: ['status'] });
            if (!user) {
                return "User not found";
            }
            const isValid = yield (0, bcrypt_1.compare)(password, user.password);
            if (!isValid) {
                return "Invalid email or password";
            }
            const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "NoNotThis";
            const token = (0, jsonwebtoken_1.sign)({ userId: user.id, email: user.email }, secret, { expiresIn: '1d' });
            return { user, token };
        });
    }
    // Créer un Administrateur
    createAdmin(createAdminRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = this.db.getRepository(user_1.User);
                const status = yield this.db.getRepository(status_1.Status)
                    .createQueryBuilder("status")
                    .where("status.type = :status", { status: "ADMIN" })
                    .getOne();
                if (!status) {
                    return "Status ADMIN not found";
                }
                const hashedPassword = yield (0, bcrypt_1.hash)(createAdminRequest.password, 10);
                const newUser = userRepository.create({
                    name: createAdminRequest.name,
                    email: createAdminRequest.email,
                    password: hashedPassword,
                    status: status
                });
                const savedUser = yield userRepository.save(newUser);
                return savedUser;
            }
            catch (error) {
                console.error(error);
                return "Internal error, please try again later";
            }
        });
    }
    // Mettre à jour un utilisateur (Adhérent, Admin, Bienfaiteur)
    updateUser(id, userToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id, isDeleted: false }, relations: ['status'] });
            if (!userFound) {
                return "User not found!";
            }
            const isValid = yield (0, bcrypt_1.compare)(userToUpdate.actual_password, userFound.password);
            if (!isValid) {
                return "Actual password incorrect!";
            }
            if (userToUpdate.email) {
                userFound.email = userToUpdate.email;
            }
            if (userToUpdate.name) {
                userFound.name = userToUpdate.name;
            }
            if (userToUpdate.password) {
                userFound.password = yield (0, bcrypt_1.hash)(userToUpdate.password, 10);
            }
            const updatedUser = yield userRepo.save(userFound);
            return updatedUser;
        });
    }
    // Bannir un utilisateur (définir isDeleted à true)
    banUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id, isDeleted: false } });
            if (!userFound) {
                return "User not found";
            }
            userFound.isDeleted = true;
            yield userRepo.save(userFound);
            return `User ${userFound.name} has been banned successfully.`;
        });
    }
    // Lister les utilisateurs avec des filtres
    listUser(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.getRepository(user_1.User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.status', 'status')
                .leftJoinAndSelect('user.skills', 'skill')
                .where('user.isDeleted = :isDeleted', { isDeleted: false });
            const page = Number(filter.page) || 1; // Valeur par défaut si page n'est pas définie
            const limit = Number(filter.limit) || 10; // Valeur par défaut si limit n'est pas définie
            // Vérification du type des paramètres de pagination
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                return "Invalid page or limit parameters.";
            }
            if (filter.type) {
                const status = yield this.db.getRepository(status_1.Status)
                    .createQueryBuilder('status')
                    .where('status.type = :type', { type: filter.type })
                    .getOne();
                if (status) {
                    query.andWhere('user.status.id = :statusId', { statusId: status.id });
                }
                else {
                    return `Nothing Found for type: ${filter.type}`;
                }
            }
            if (filter.skills && filter.skills.length > 0) {
                query.andWhere('skill.name IN (:...skills)', { skills: filter.skills });
            }
            query.skip((page - 1) * limit).take(limit);
            const [users, totalCount] = yield query.getManyAndCount();
            return { users, totalCount };
        });
    }
    getUserDemandes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({
                where: { id: userId, isDeleted: false },
                relations: ['demandes']
            });
            if (!userFound) {
                return "User not found";
            }
            return userFound.demandes;
        });
    }
    getUserEvenementAttendees(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({
                where: { id: userId, isDeleted: false },
                relations: ['evenementAttendees']
            });
            if (!userFound) {
                return "User not found";
            }
            return userFound.evenementAttendees;
        });
    }
    // Récupérer un utilisateur par ID
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id, isDeleted: false }, relations: ['status', 'skills'] });
            if (!userFound) {
                return "User not found";
            }
            return userFound;
        });
    }
    // Ajouter une compétence à un utilisateur
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
    // Récupérer les utilisateurs par rôle
    getUsersByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const status = yield this.db.getRepository(status_1.Status)
                .createQueryBuilder('status')
                .where('status.type = :role', { role })
                .getOne();
            if (!status) {
                throw new Error(`Role ${role} not found`);
            }
            const users = yield userRepo.find({
                where: { status: status, isDeleted: false },
                relations: ['status', 'skills'],
            });
            return users;
        });
    }
    // Récupérer les utilisateurs disponibles par statut
    getAvailableUsersByStatus(statusDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.db.getRepository(status_1.Status)
                .createQueryBuilder('status')
                .where('status.type = :type', { type: statusDescription })
                .getOne();
            if (!status) {
                throw new Error(`Status with description ${statusDescription} not found`);
            }
            const users = yield this.db.getRepository(user_1.User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.status', 'status')
                .where('user.status.id = :statusId', { statusId: status.id })
                .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
                .andWhere('user.isAvailable = :isAvailable', { isAvailable: true })
                .getMany();
            return users;
        });
    }
    // Récupérer tous les utilisateurs disponibles
    getAllUsersAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const missions = yield this.db.getRepository(mission_1.Mission).find({ relations: ['assignedUsers'] });
            const currentDate = new Date();
            for (const mission of missions) {
                for (const user of mission.assignedUsers) {
                    if (currentDate > mission.ending && user.isAvailable === false) {
                        user.isAvailable = true;
                        yield userRepo.save(user);
                    }
                }
            }
            return yield userRepo.find({ where: { isDeleted: false } });
        });
    }
    // Récupérer tous les utilisateurs
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getRepository(user_1.User).find({ where: { isDeleted: false } });
        });
    }
    getCurrentUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const user = yield userRepo.findOne({
                where: { id: userId, isDeleted: false },
                select: ['id', 'name', 'email', 'status'],
                relations: ['status']
            });
            if (!user) {
                return "User not found";
            }
            return user;
        });
    }
}
exports.UserUsecase = UserUsecase;
