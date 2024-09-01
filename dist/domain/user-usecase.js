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
const demande_1 = require("../database/entities/demande");
const evenementAttendee_1 = require("../database/entities/evenementAttendee");
const donation_1 = require("../database/entities/donation");
class UserUsecase {
    constructor(db) {
        this.db = db;
    }
    loginUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userRepo = this.db.getRepository(user_1.User);
            const user = yield userRepo.findOne({ where: { email, isDeleted: false }, relations: ['status', 'cotisations'] });
            if (!user) {
                return "User not found";
            }
            const isValid = yield (0, bcrypt_1.compare)(password, user.password);
            if (!isValid) {
                return "Invalid email or password";
            }
            const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "NoNotThis";
            const token = (0, jsonwebtoken_1.sign)({ userId: user.id, email: user.email }, secret, { expiresIn: '1d' });
            // Obtenir la dernière cotisation de l'utilisateur (s'il y en a une)
            const latestCotisation = user.cotisations.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
            return {
                user,
                token,
                expirationDate: latestCotisation ? latestCotisation.expirationDate : undefined, // Retourner la date d'expiration
            };
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
    // Créer un Adhérent
    createAdherent(createAdherentRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = this.db.getRepository(user_1.User);
                // Rechercher le statut MEMBER
                const status = yield this.db.getRepository(status_1.Status)
                    .createQueryBuilder("status")
                    .where("status.type = :status", { status: "MEMBER" })
                    .getOne();
                if (!status) {
                    return "Status MEMBER not found";
                }
                // Hash du mot de passe
                const hashedPassword = yield (0, bcrypt_1.hash)(createAdherentRequest.password, 10);
                // Créer un nouvel utilisateur avec adresse et dateDeNaissance, en convertissant null en undefined
                const newUser = {
                    name: createAdherentRequest.name,
                    email: createAdherentRequest.email,
                    password: hashedPassword,
                    status: status,
                    adresse: createAdherentRequest.adresse || undefined, // Conversion de null en undefined
                    dateDeNaissance: createAdherentRequest.dateDeNaissance || undefined // Conversion de null en undefined
                };
                // Utilisation de userRepository.create() pour créer l'utilisateur
                const createdUser = userRepository.create(newUser);
                // Sauvegarder l'utilisateur créé dans la base de données
                const savedUser = yield userRepository.save(createdUser);
                return savedUser;
            }
            catch (error) {
                console.error(error);
                return "Internal error, please try again later";
            }
        });
    }
    createSalarier(createSalarierRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = this.db.getRepository(user_1.User);
                // Rechercher le statut SALARIER
                const status = yield this.db.getRepository(status_1.Status)
                    .createQueryBuilder("status")
                    .where("status.type = :status", { status: "SALARIER" })
                    .getOne();
                if (!status) {
                    return "Status SALARIER not found";
                }
                // Hash du mot de passe
                const hashedPassword = yield (0, bcrypt_1.hash)(createSalarierRequest.password, 10);
                // Créer un nouvel utilisateur avec les informations fournies
                const newUser = {
                    name: createSalarierRequest.name,
                    email: createSalarierRequest.email,
                    password: hashedPassword,
                    status: status,
                    adresse: createSalarierRequest.adresse || undefined,
                    dateDeNaissance: createSalarierRequest.dateDeNaissance || undefined
                };
                // Utilisation de userRepository.create() pour créer l'utilisateur
                const createdUser = userRepository.create(newUser);
                // Sauvegarder l'utilisateur créé dans la base de données
                const savedUser = yield userRepository.save(createdUser);
                return savedUser;
            }
            catch (error) {
                console.error(error);
                return "Internal error, please try again later";
            }
        });
    }
    // Fonction pour associer les enregistrements existants à l'utilisateur nouvellement créé
    associateExistingRecords(email, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const donationRepo = this.db.getRepository(donation_1.Donation);
            const demandeRepo = this.db.getRepository(demande_1.Demande);
            const evenementAttendeeRepo = this.db.getRepository(evenementAttendee_1.EvenementAttendee);
            // Associer les donations existantes à cet utilisateur
            const donations = yield donationRepo.find({ where: { email, user: undefined } });
            for (const donation of donations) {
                donation.user = user;
                yield donationRepo.save(donation);
            }
            // Associer les demandes existantes à cet utilisateur
            const demandes = yield demandeRepo.find({ where: { email, user: undefined } });
            for (const demande of demandes) {
                demande.user = user;
                yield demandeRepo.save(demande);
            }
            // Associer les EvenementAttendees existants à cet utilisateur
            const evenementAttendees = yield evenementAttendeeRepo.find({ where: { email, user: undefined } });
            for (const attendee of evenementAttendees) {
                attendee.user = user;
                yield evenementAttendeeRepo.save(attendee);
            }
        });
    }
    updateUser(id, userToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id, isDeleted: false }, relations: ['status'] });
            if (!userFound) {
                return "User not found!";
            }
            // Mise à jour des champs sans avoir besoin du mot de passe actuel
            if (userToUpdate.email) {
                userFound.email = userToUpdate.email;
            }
            if (userToUpdate.name) {
                userFound.name = userToUpdate.name;
            }
            if (userToUpdate.adresse !== undefined) {
                userFound.adresse = userToUpdate.adresse;
            }
            if (userToUpdate.dateDeNaissance !== undefined) {
                userFound.dateDeNaissance = userToUpdate.dateDeNaissance;
            }
            if (userToUpdate.password) {
                userFound.password = yield (0, bcrypt_1.hash)(userToUpdate.password, 10); // Hashing du mot de passe s'il est fourni
            }
            if (userToUpdate.statusId) {
                const statusRepo = this.db.getRepository(status_1.Status);
                const newStatus = yield statusRepo.findOne({ where: { id: userToUpdate.statusId } });
                if (newStatus) {
                    userFound.status = newStatus;
                }
            }
            const updatedUser = yield userRepo.save(userFound);
            return updatedUser;
        });
    }
    // Bannir un utilisateur (définir isDeleted à true)
    banUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            // Trouver l'utilisateur
            const userFound = yield userRepo.findOne({ where: { id, isDeleted: false } });
            if (!userFound) {
                return { success: false, message: "User not found or already banned." };
            }
            if (userFound.isBanned) {
                // Débannir l'utilisateur
                userFound.isBanned = false;
                yield userRepo.save(userFound);
                return { success: true, message: `User ${userFound.name} has been unbanned successfully.` };
            }
            else {
                // Bannir l'utilisateur
                userFound.isBanned = true;
                yield userRepo.save(userFound);
                return { success: true, message: `User ${userFound.name} has been banned successfully.` };
            }
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
    changePassword(userId, oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const user = yield userRepo.findOne({
                where: { id: userId, isDeleted: false }
            });
            if (!user) {
                return "User not found";
            }
            // Comparaison de l'ancien mot de passe avec le hash stocké
            const isValid = yield (0, bcrypt_1.compare)(oldPassword, user.password);
            if (!isValid) {
                return "Invalid old password";
            }
            // Hashage du nouveau mot de passe
            const hashedPassword = yield (0, bcrypt_1.hash)(newPassword, 10);
            user.password = hashedPassword;
            // Sauvegarde du nouvel utilisateur avec le mot de passe mis à jour
            yield userRepo.save(user);
            return "Password updated successfully";
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
    getUsersByStatus(statusDescription) {
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
                .andWhere('user.isBanned = :isBanned', { isBanned: false })
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
            return yield this.db.getRepository(user_1.User).find({ where: { isBanned: false } });
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
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = this.db.getRepository(user_1.User);
            const user = yield userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return "Utilisateur non trouvé";
            }
            yield userRepository.remove(user);
            return "Utilisateur supprimé avec succès";
        });
    }
}
exports.UserUsecase = UserUsecase;
