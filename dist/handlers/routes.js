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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoutes = void 0;
const bcrypt_1 = require("bcrypt");
const database_1 = require("../database/database");
const user_validator_1 = require("./validators/user-validator");
const generate_validation_message_1 = require("./validators/generate-validation-message");
const user_1 = require("../database/entities/user");
const status_1 = require("../database/entities/status");
const status_validator_1 = require("./validators/status-validator");
const jsonwebtoken_1 = require("jsonwebtoken");
const token_1 = require("../database/entities/token");
const user_validator_2 = require("./validators/user-validator");
const user_usecase_1 = require("../domain/user-usecase");
const normal_middleware_1 = require("./middleware/normal-middleware");
const admin_middleware_1 = require("./middleware/admin-middleware");
const combMiddleware_1 = require("./middleware/combMiddleware");
const donation_1 = require("../database/entities/donation");
const benefactor_middleware_1 = require("./middleware/benefactor-middleware");
const donation_validator_1 = require("./validators/donation-validator");
const expenditure_1 = require("../database/entities/expenditure");
const expenditure_usecase_1 = require("../domain/expenditure-usecase");
const expenditure_validator_1 = require("./validators/expenditure-validator");
const mission_usecase_1 = require("../domain/mission-usecase");
const evenement_usecase_1 = require("../domain/evenement-usecase");
const projet_usecase_1 = require("../domain/projet-usecase");
const step_usecase_1 = require("../domain/step-usecase");
const mission_validator_1 = require("./validators/mission-validator");
const projet_validator_1 = require("./validators/projet-validator");
const step_validator_1 = require("./validators/step-validator");
const review_usecase_1 = require("../domain/review-usecase");
const review_validator_1 = require("./validators/review-validator");
const evenement_1 = require("../database/entities/evenement");
// import { UserDocument } from "../database/entities/document";
const vote_validator_1 = require("./validators/vote-validator");
// import { VoteUsecase } from "../domain/vote-usecase";
const round_validator_1 = require("./validators/round-validator");
const round_usecase_1 = require("../domain/round-usecase");
const proposition_validator_1 = require("./validators/proposition-validator");
const proposition_1 = require("../database/entities/proposition");
const proposition_usecase_1 = require("../domain/proposition-usecase");
const evenement_2 = require("../database/entities/evenement");
const vote_record_1 = require("../database/entities/vote-record");
const location_1 = require("../database/entities/location");
const evenement_attendee_1 = require("../database/entities/evenement-attendee");
const notification_1 = require("../database/entities/notification");
const multer_1 = __importDefault(require("multer"));
const stream_1 = require("stream");
const note_usecase_1 = require("../domain/note-usecase");
// import { SkillUsecase } from "../domain/skill-usecase";
const skill_validator_1 = require("./validators/skill-validator");
const skill_1 = require("../database/entities/skill");
const notification_usecase_1 = require("../domain/notification-usecase");
const ressource_usecase_1 = require("../domain/ressource-usecase");
const ressource_validator_1 = require("./validators/ressource-validator");
const evenement_validator_1 = require("./validators/evenement-validator");
const skill_usecase_1 = require("../domain/skill-usecase");
const vote_usecase_1 = require("../domain/vote-usecase");
const document_1 = require("../database/entities/document");
const axios_1 = __importDefault(require("axios"));
// >>>>>>> dev-brad
const upload = (0, multer_1.default)();
const paypal = require("./paypal");
// const open = require('open');
const initRoutes = (app, documentUsecase) => {
    const missionUsecase = new mission_usecase_1.MissionUsecase(database_1.AppDataSource);
    const evenementUsecase = new evenement_usecase_1.EvenementUsecase(database_1.AppDataSource);
    const projetUsecase = new projet_usecase_1.ProjetUsecase(database_1.AppDataSource);
    const stepUsecase = new step_usecase_1.StepUsecase(database_1.AppDataSource);
    const reviewUsecase = new review_usecase_1.ReviewUsecase(database_1.AppDataSource);
    //  const subjectUsecase = new SubjectUsecase(AppDataSource);
    const voteUsecase = new vote_usecase_1.VoteUsecase(database_1.AppDataSource);
    // const responseUsecase = new ResponseUsecase(AppDataSource);
    const noteUsecase = new note_usecase_1.NoteUsecase(database_1.AppDataSource);
    const userUsecase = new user_usecase_1.UserUsecase(database_1.AppDataSource);
    const skillUsecase = new skill_usecase_1.SkillUsecase(database_1.AppDataSource);
    const notificationUsecase = new notification_usecase_1.NotificationUsecase(database_1.AppDataSource);
    const roundUsecase = new round_usecase_1.RoundUsecase(database_1.AppDataSource);
    const propositionUsecase = new proposition_usecase_1.PropositionUsecase(database_1.AppDataSource);
    //la route utilisee pour creer les statuts est bloquee volontairement
    app.post('/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = status_validator_1.createStatusValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createStatusRequest = validationResult.value;
            const statusRepository = database_1.AppDataSource.getRepository(status_1.Status);
            if (createStatusRequest.key) {
                const key = yield (0, bcrypt_1.hash)(createStatusRequest.key, 10);
                const status = yield statusRepository.save({
                    description: createStatusRequest.description,
                    key: key
                });
                res.status(201).json(status);
            }
            else {
                const keyy = "No key";
                const key = yield (0, bcrypt_1.hash)(keyy, 10);
                const status = yield statusRepository.save({
                    description: createStatusRequest.description,
                    key: key
                });
                res.status(201).json(status);
            }
            return;
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ "error": "internal error retry later" });
            return;
        }
    }));
    app.get('/users', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const validation = user_validator_1.listUsersValidation.validate(req.query);
        if (validation.error) {
            res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listUserRequest = validation.value;
        let limit = 10;
        if (listUserRequest.limit) {
            limit = listUserRequest.limit;
        }
        let type = "";
        if (listUserRequest.type) {
            type = listUserRequest.type;
        }
        const page = (_a = listUserRequest.page) !== null && _a !== void 0 ? _a : 1;
        const skills = (_b = listUserRequest.skills) !== null && _b !== void 0 ? _b : [];
        try {
            const userUsecase = new user_usecase_1.UserUsecase(database_1.AppDataSource);
            // Libérer les utilisateurs avant de récupérer les utilisateurs disponibles
            yield userUsecase.getAllUsers();
            let listusers = [];
            if (type === "NORMAL") {
                listusers = yield userUsecase.getAvailableUsersByStatus("NORMAL");
            }
            else {
                // Logic for other types if needed
                // Exemple: listusers = await userUsecase.getAvailableUsersByStatus(type);
            }
            res.status(200).json({ users: listusers, totalCount: listusers.length });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.get("/users/:id", combMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.userIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const userId = validationResult.value;
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield userRepository.findOneBy({ id: userId.id, isDeleted: false });
            if (user === null) {
                res.status(404).json({ "error": `user ${userId.id} not found` });
                return;
            }
            res.status(200).json(user);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.post('/expenditure', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = donation_validator_1.createDonationValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createDonationRequest = validationResult.value;
            const authHeader = req.headers['authorization'];
            if (!authHeader)
                return res.status(401).json({ "error": "Unauthorized" });
            const token = authHeader.split(' ')[1];
            if (token === null)
                return res.status(401).json({ "error": "Unauthorized" });
            const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
            const tokenFound = yield tokenRepo.findOne({ where: { token }, relations: ['user'] });
            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }
            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error u" });
            }
            const userRepo = database_1.AppDataSource.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id } });
            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error stat " });
            }
            const expenditureRepository = database_1.AppDataSource.getRepository(expenditure_1.Expenditures);
            const newExpenditure = expenditureRepository.create({
                amount: createDonationRequest.amount,
                user: userFound,
                description: createDonationRequest.description
            });
            yield expenditureRepository.save(newExpenditure);
            if (yield paypal.createPayout(createDonationRequest.amount, 'EUR')) {
                res.status(200).json({
                    message: "Expenditure successfully registered and the amount of " + createDonationRequest.amount + "€ has been transfered",
                    CheckThemAllHere: "http:localhost:3000/expenditures"
                });
            }
            // await open(url);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.get('/expenditures', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = expenditure_validator_1.listExpendituresValidation.validate(req.query);
        if (validation.error) {
            res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listExpenditureRequest = validation.value;
        let limit = 10;
        if (listExpenditureRequest.limit) {
            limit = listExpenditureRequest.limit;
        }
        let id = 0;
        if (listExpenditureRequest.id) {
            id = listExpenditureRequest.id;
        }
        const page = (_a = listExpenditureRequest.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const expenditureUsecase = new expenditure_usecase_1.ExpenditureUsecase(database_1.AppDataSource);
            const listusers = yield expenditureUsecase.listExpenditure(Object.assign(Object.assign({}, listExpenditureRequest), { page, limit, id }));
            res.status(200).json(listusers);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.get("/expenditures/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.userIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const expenditureId = validationResult.value;
            const userRepository = database_1.AppDataSource.getRepository(expenditure_1.Expenditures);
            const user = yield userRepository.findOneBy({ id: expenditureId.id });
            if (user === null) {
                res.status(404).json({ "error": `Expenditure ${expenditureId.id} not found` });
                return;
            }
            res.status(200).json(user);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.post('/Donation', benefactor_middleware_1.benefactorMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = donation_validator_1.createDonationValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createDonationRequest = validationResult.value;
            const authHeader = req.headers['authorization'];
            if (!authHeader)
                return res.status(401).json({ "error": "Unauthorized" });
            const token = authHeader.split(' ')[1];
            if (token === null)
                return res.status(401).json({ "error": "Unauthorized" });
            const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
            const tokenFound = yield tokenRepo.findOne({ where: { token }, relations: ['user'] });
            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }
            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error u" });
            }
            const userRepo = database_1.AppDataSource.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id } });
            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error stat " });
            }
            const donationRepository = database_1.AppDataSource.getRepository(donation_1.Donation);
            const newDonation = donationRepository.create({
                amount: createDonationRequest.amount,
                description: createDonationRequest.description,
                remaining: createDonationRequest.amount,
                benefactor: userFound
            });
            yield donationRepository.save(newDonation);
            const url = yield paypal.createOrder(createDonationRequest.description, createDonationRequest.amount);
            res.status(200).json({ message: "open this on your current navigator: " + url });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.get('/validateDonation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield paypal.capturePayment(req.query.token);
            res.status(200).json({
                message: "Donation perfectly done",
                CheckThemAllHeres: "http:localhost:3000/donations"
            });
        }
        catch (error) {
            res.send("Error: " + error);
        }
    }));
    app.get('/cancelDonation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const donationRepository = database_1.AppDataSource.getRepository(donation_1.Donation);
            const latestDonation = yield donationRepository.findOne({
                where: {
                    isCanceled: false
                },
                order: {
                    createdAt: 'DESC'
                }
            });
            if (latestDonation) {
                latestDonation.isCanceled = true;
                yield donationRepository.save(latestDonation);
            }
            res.status(200).json({
                message: "Donation successfully canceled",
                CheckThemAllHeres: "http:localhost:3000/donations"
            });
        }
        catch (error) {
            res.send("Error: " + error);
        }
    }));
    app.get('/donations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const query = database_1.AppDataSource.getRepository(donation_1.Donation)
            .createQueryBuilder('donation')
            .where('donation.isCanceled= false');
        const [donation, totalCount] = yield query.getManyAndCount();
        res.status(200).json({
            donation,
            totalCount
        });
    }));
    app.get("/donations/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.userIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const expenditureId = validationResult.value;
            const userRepository = database_1.AppDataSource.getRepository(donation_1.Donation);
            const user = yield userRepository.findOneBy({ id: expenditureId.id, isCanceled: false });
            if (user === null) {
                res.status(404).json({ "error": `Donation ${expenditureId.id} not found` });
                return;
            }
            res.status(200).json(user);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.createOtherValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createOtherRequest = validationResult.value;
            const hashedPassword = yield (0, bcrypt_1.hash)(createOtherRequest.password, 10);
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const status = yield database_1.AppDataSource.getRepository(status_1.Status)
                .createQueryBuilder("status")
                .where("status.description = :status", { status: "NORMAL" })
                .getOne();
            if (status) {
                // Fetch or create skills
                const skillRepo = database_1.AppDataSource.getRepository(skill_1.Skill);
                let skills = [];
                if (createOtherRequest.skills && createOtherRequest.skills.length > 0) {
                    skills = yield Promise.all(createOtherRequest.skills.map((skillName) => __awaiter(void 0, void 0, void 0, function* () {
                        let skill = yield skillRepo.findOne({ where: { name: skillName } });
                        if (!skill) {
                            skill = skillRepo.create({ name: skillName });
                            yield skillRepo.save(skill);
                        }
                        return skill;
                    })));
                }
                const newUser = userRepository.create({
                    name: createOtherRequest.name,
                    email: createOtherRequest.email,
                    password: hashedPassword,
                    status: status,
                    skills: skills
                });
                const savedUser = yield userRepository.save(newUser);
                res.status(201).json(savedUser);
            }
            else {
                res.status(400).json({ "error": "Status NORMAL not found" });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const validationResult = user_validator_1.loginOtherValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const loginOtherRequest = validationResult.value;
            // valid other exist
            const other = yield database_1.AppDataSource.getRepository(user_1.User).findOne({
                where: {
                    email: loginOtherRequest.email,
                    isDeleted: false
                },
                relations: ["status"]
            });
            if (!other) {
                res.status(400).json({ error: "user not found" });
                return;
            }
            // valid password for this other
            const isValid = yield (0, bcrypt_1.compare)(loginOtherRequest.password, other.password);
            if (!isValid) {
                res.status(400).json({ error: "email or password not valid" });
                return;
            }
            const status = yield database_1.AppDataSource.getRepository(status_1.Status).findOneBy({
                id: other.status.id
            });
            if (!status || (status && status.description != "NORMAL")) {
                res.status(400).json({ error: "user not recognised" });
                return;
            }
            const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "NoNotThis";
            //console.log(secret)
            // generate jwt
            const token = (0, jsonwebtoken_1.sign)({ otherId: other.id, email: other.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            yield database_1.AppDataSource.getRepository(token_1.Token).save({ token: token, user: other });
            res.status(200).json({ other, token, message: "authenticated ✅" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ "error": "internal error retry later" });
            return;
        }
    }));
    app.patch("/users/:id", normal_middleware_1.normalMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = user_validator_1.updateUserValidation.validate(Object.assign(Object.assign({}, req.body), req.params));
        if (validation.error) {
            res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateUserRequest = validation.value;
        try {
            const updatedUser = yield userUsecase.updateUser(updateUserRequest.id, Object.assign({}, updateUserRequest));
            if (updatedUser === null) {
                res.status(404).json({ "error": `user ${updateUserRequest.id} not found` });
                return;
            }
            res.status(200).json(updatedUser);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.delete("/users/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.updateUserValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const userProto = validationResult.value;
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield userRepository.findOneBy({ id: userProto.id, isDeleted: false });
            if (!user) {
                res.status(404).json({ error: `User ${userProto.id} not found` });
                return;
            }
            const isValid = yield (0, bcrypt_1.compare)(userProto.actual_password, user.password);
            if (!isValid) {
                res.status(400).json({ error: "Actual password incorrect" });
                return;
            }
            user.isDeleted = true;
            const userDeleted = yield userRepository.save(user);
            res.status(200).json(userDeleted);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.get('/users/emails', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { role } = req.query;
        if (!role) {
            return res.status(400).json({ message: 'Role parameter is required' });
        }
        try {
            const emails = yield userUsecase.getUsersByRole(role);
            res.status(200).json(emails);
        }
        catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    //Pour creer un admin , une cle sera demandee , la retrouver dans le readme
    app.post('/admin/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_2.createAdminValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createOtherRequest = validationResult.value;
            const hashedPassword = yield (0, bcrypt_1.hash)(createOtherRequest.password, 10);
            const status = yield database_1.AppDataSource.getRepository(status_1.Status)
                .createQueryBuilder("status")
                .where("status.description = :description", { description: "ADMIN" })
                .getOne();
            if (!status) {
                res.status(500).json({ error: "Status not found" });
                return;
            }
            if (!createOtherRequest.key) {
                res.status(400).json({ error: "Key is required" });
                return;
            }
            const isKeyValid = yield (0, bcrypt_1.compare)(createOtherRequest.key, status.key);
            if (!isKeyValid) {
                res.status(400).json({ error: "Invalid key" });
                return;
            }
            // Save the new user to the database
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const newUser = userRepository.create({
                name: createOtherRequest.name,
                email: createOtherRequest.email,
                password: hashedPassword,
                status: status
            });
            yield userRepository.save(newUser);
            res.status(201).json(newUser);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ "error": "internal error retry later" });
            return;
        }
    }));
    app.post('/admin/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const validationResult = user_validator_1.loginOtherValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const loginAdminRequest = validationResult.value;
            // valid other exist
            const admin = yield database_1.AppDataSource.getRepository(user_1.User).findOne({
                where: {
                    email: loginAdminRequest.email,
                    isDeleted: false
                },
                relations: ["status"]
            });
            if (!admin) {
                res.status(400).json({ error: "email or password not valid" });
                return;
            }
            // valid password for this other
            const isValid = yield (0, bcrypt_1.compare)(loginAdminRequest.password, admin.password);
            if (!isValid) {
                res.status(400).json({ error: "email or password not valid" });
                return;
            }
            const status = yield database_1.AppDataSource.getRepository(status_1.Status).findOneBy({
                id: admin.status.id
            });
            if (!status || (status && status.description != "ADMIN")) {
                res.status(400).json({ error: "user not recognised" });
                return;
            }
            const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "NoNotThiss";
            //console.log(secret)
            // generate jwt
            const token = (0, jsonwebtoken_1.sign)({ adminId: admin.id, email: admin.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            yield database_1.AppDataSource.getRepository(token_1.Token).save({ token: token, user: admin });
            res.status(200).json({ admin, token, message: "authenticated ✅" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ "error": "internal error retry later" });
            return;
        }
    }));
    app.patch("/admins/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = user_validator_1.updateUserValidation.validate(Object.assign(Object.assign({}, req.body), req.params));
        if (validation.error) {
            res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateUserRequest = validation.value;
        try {
            const userUsecase = new user_usecase_1.UserUsecase(database_1.AppDataSource);
            const updatedUser = yield userUsecase.updateAdmin(updateUserRequest.id, Object.assign({}, updateUserRequest));
            if (updatedUser === null) {
                res.status(404).json({ "error": `user ${updateUserRequest.id} not found` });
                return;
            }
            res.status(200).json(updatedUser);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.get('/auth/me', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            const userRepo = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield userRepo.findOne({
                where: { id: userId, isDeleted: false },
                select: ['id', 'name', 'email', 'status'],
                relations: ['status']
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json(user);
        }
        catch (error) {
            console.error("Failed to fetch user details:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }));
    app.delete("/admins/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.updateUserValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const userProto = validationResult.value;
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield userRepository.findOneBy({ id: userProto.id, isDeleted: false });
            if (user === null) {
                res.status(404).json({ "error": `user ${userProto.id} not found` });
                return;
            }
            const isValid = yield (0, bcrypt_1.compare)(userProto.actual_password, user.password);
            if (!isValid) {
                return "Actual password incorrect !!!";
            }
            // const userDeleted = await userRepository.remove(user)
            user.isDeleted = true;
            const userDeleted = yield userRepository.save(user);
            res.status(200).json(userDeleted);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.post('/users/:userId/skills', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = parseInt(req.params.userId);
        const { skillName } = req.body;
        try {
            const result = yield userUsecase.addSkillToUser(userId, skillName);
            res.status(200).send(result);
        }
        catch (error) {
            res.status(500).send({ error: 'Internal server error' });
        }
    }));
    app.post('/benefactor/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.createOtherValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createOtherRequest = validationResult.value;
            const hashedPassword = yield (0, bcrypt_1.hash)(createOtherRequest.password, 10);
            const status = yield database_1.AppDataSource.getRepository(status_1.Status)
                .createQueryBuilder("status")
                .where("status.description = :description", { description: "BENEFACTOR" })
                .getOne();
            if (!status) {
                res.status(500).json({ error: "Status not found" });
                return;
            }
            // Save the new user to the database
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const newUser = userRepository.create({
                name: createOtherRequest.name,
                email: createOtherRequest.email,
                password: hashedPassword,
                status: status
            });
            yield userRepository.save(newUser);
            res.status(201).json(newUser);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ "error": "internal error retry later" });
            return;
        }
    }));
    app.post('/benefactor/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const validationResult = user_validator_1.loginOtherValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const loginOtherRequest = validationResult.value;
            // valid other exist
            const other = yield database_1.AppDataSource.getRepository(user_1.User).findOne({
                where: {
                    email: loginOtherRequest.email,
                    isDeleted: false
                },
                relations: ["status"]
            });
            if (!other) {
                res.status(400).json({ error: "user not found" });
                return;
            }
            // valid password for this other
            const isValid = yield (0, bcrypt_1.compare)(loginOtherRequest.password, other.password);
            if (!isValid) {
                res.status(400).json({ error: "email or password not valid" });
                return;
            }
            const status = yield database_1.AppDataSource.getRepository(status_1.Status).findOneBy({
                id: other.status.id
            });
            if (!status || (status && status.description != "BENEFACTOR")) {
                res.status(400).json({ error: "user not recognised" });
                return;
            }
            const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "NoNotThisss";
            //console.log(secret)
            // generate jwt
            const token = (0, jsonwebtoken_1.sign)({ otherId: other.id, email: other.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            yield database_1.AppDataSource.getRepository(token_1.Token).save({ token: token, user: other });
            res.status(200).json({ other, token, message: "authenticated ✅" });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ "error": "internal error retry later" });
            return;
        }
    }));
    app.patch("/benefactors/:id", benefactor_middleware_1.benefactorMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = user_validator_1.updateUserValidation.validate(Object.assign(Object.assign({}, req.body), req.params));
        if (validation.error) {
            res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateUserRequest = validation.value;
        try {
            const userUsecase = new user_usecase_1.UserUsecase(database_1.AppDataSource);
            const updatedUser = yield userUsecase.updateBenefactor(updateUserRequest.id, Object.assign({}, updateUserRequest));
            if (updatedUser === null) {
                res.status(404).json({ "error": `user ${updateUserRequest.id} not found` });
                return;
            }
            res.status(200).json(updatedUser);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.delete("/benefactors/:id", benefactor_middleware_1.benefactorMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.updateUserValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const userProto = validationResult.value;
            const userRepository = database_1.AppDataSource.getRepository(user_1.User);
            const user = yield userRepository.findOneBy({ id: userProto.id, isDeleted: false });
            if (user === null) {
                res.status(404).json({ "error": `user ${userProto.id} not found` });
                return;
            }
            const isValid = yield (0, bcrypt_1.compare)(userProto.actual_password, user.password);
            if (!isValid) {
                return "Actual password incorrect !!!";
            }
            user.isDeleted = true;
            const userDeleted = yield userRepository.save(user);
            res.status(200).json(userDeleted);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    // <<<<<<< merge_fi2
    // =======
    // app.post("/evenements",adminMiddleware,async (req: Request, res: Response) => {
    //     try {
    //         const validation = evenementValidation.validate(req.body);
    //         if (validation.error) {
    //             res.status(400).send(generateValidationErrorMessage(validation.error.details));
    //             return;
    //         }
    //         const ev = validation.value;
    //         const authHeader = req.headers['authorization'];
    //         if (!authHeader) return res.status(401).json({ "error": "Unauthorized" });
    //         const token = authHeader.split(' ')[1];
    //         if (token === null) return res.status(401).json({ "error": "Unauthorized" });
    //         const tokenRepo = AppDataSource.getRepository(Token);
    //         const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });
    //         if (!tokenFound) {
    //             return res.status(403).json({ "error": "Access Forbidden" });
    //         }
    //         if (!tokenFound.user) {
    //             return res.status(500).json({ "error": "Internal server error u"});
    //         }
    //         const userRepo = AppDataSource.getRepository(User);
    //         const userFound = await userRepo.findOne({ where: { id:tokenFound.user.id }});
    //         if (!userFound) {
    //             return res.status(500).json({ "error": "Internal server error stat "});
    //         }
    //         const evRepository = AppDataSource.getRepository(Evenement);
    //         const conflictingEvents = await evRepository.createQueryBuilder('event')
    //         .where(':starting < event.ending AND :ending > event.starting', { starting: ev.starting, ending: ev.ending })
    //         .getMany();
    //         if (conflictingEvents.length > 0) {
    //             return res.status(409).json({ "error": "Conflicting event exists" });
    //         }
    //         if(ev.type=="AG" && !ev.quorum){
    //             res.status(201).json({"message":"Quorum non indicated"});
    //         }else if(ev.type!="AG"){
    //             ev.quorum=0
    //         }
    //         const newEvent = evRepository.create({
    //             user:userFound,
    //             type:ev.type,
    //             description:ev.description,
    //             quorum:ev.quorum,
    //             starting:ev.starting,
    //             ending:ev.ending,
    //             location:ev.location
    //         });
    //         await evRepository.save(newEvent);
    //         res.status(201).json(newEvent);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // >>>>>>> merge_fi
    app.post("/evenements", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            // Validate request body
            const validation = evenement_validator_1.evenementValidation.validate(req.body);
            if (validation.error) {
                return res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            }
            const ev = validation.value;
            // Authorization check
            const authHeader = req.headers["authorization"];
            if (!authHeader)
                return res.status(401).json({ error: "Unauthorized" });
            const token = authHeader.split(" ")[1];
            if (token === null)
                return res.status(401).json({ error: "Unauthorized" });
            const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
            const tokenFound = yield tokenRepo.findOne({
                where: { token },
                relations: ["user"],
            });
            if (!tokenFound || !tokenFound.user) {
                return res.status(403).json({ error: "Access Forbidden" });
            }
            const userRepo = database_1.AppDataSource.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id } });
            if (!userFound) {
                return res.status(500).json({ error: "Internal server error" });
            }
            const locRepo = database_1.AppDataSource.getRepository(location_1.Location);
            let locFound = yield locRepo.findOne({ where: { position: ev.location } });
            if (!locFound) {
                locFound = locRepo.create({ position: ev.location });
                yield locRepo.save(locFound);
            }
            // Collect all attendees
            const attFound = [];
            if (ev.attendees) {
                for (const attendee of ev.attendees) {
                    try {
                        const user = yield userRepo.findOne({ where: { id: attendee.userId, isDeleted: false } });
                        if (user) {
                            attFound.push({ user, role: attendee.role });
                        }
                        else {
                            return res.status(500).json({ error: `User with ID ${attendee.userId} not found.` });
                        }
                    }
                    catch (error) {
                        return res.status(500).json({ error: `User with ID ${attendee.userId} not found.` });
                    }
                }
                // Validate event configuration
                if (ev.type === "AG" && (!ev.quorum || ev.quorum <= 0 || !ev.repetitivity || ev.repetitivity === evenement_2.repetitivity.NONE)) {
                    return res.status(400).json({ message: "AG not well configured" });
                }
                else if (ev.type !== "AG") {
                    ev.quorum = 0;
                    ev.repetitivity = evenement_2.repetitivity.NONE;
                }
                if (ev.type === "AG" && attFound.length === 0) {
                    return res.status(500).json({ error: "AG type event must have at least one attendee." });
                }
                const importantAttendeesCount = attFound.filter(attendee => attendee.role === evenement_attendee_1.AttendeeRole.IMPORTANT).length;
                if (importantAttendeesCount > ((_a = ev.quorum) !== null && _a !== void 0 ? _a : 0)) {
                    return res.status(500).json({ error: "Number of important attendees cannot exceed quorum." });
                }
                // Check for conflicting events
                const evRepository = database_1.AppDataSource.getRepository(evenement_1.Evenement);
                const conflictingEvents = yield evRepository
                    .createQueryBuilder("event")
                    .where(":starting < event.ending AND :ending > event.starting", {
                    starting: ev.starting,
                    ending: ev.ending,
                })
                    .getMany();
                if (conflictingEvents.length > 0) {
                    return res.status(409).json({ error: "Conflicting event exists" });
                }
                if (ev.isVirtual && !ev.virtualLink) {
                    return res.status(409).json({ error: "Veuillez préciser le lien de réunion" });
                }
                else if (!ev.isVirtual) {
                    ev.virtualLink = "";
                }
                // Create and save the new event
                const newEvent = evRepository.create({
                    typee: ev.type,
                    description: ev.description,
                    quorum: (_b = ev.quorum) !== null && _b !== void 0 ? _b : 0,
                    isVirtual: ev.isVirtual,
                    virtualLink: (_c = ev.virtualLink) !== null && _c !== void 0 ? _c : "",
                    starting: new Date(ev.starting),
                    ending: new Date(ev.ending),
                    repetitivity: ev.repetitivity,
                    user: userFound,
                    attendees: attFound.map(att => att.user),
                    location: [locFound],
                });
                // Create notifications for each attendee
                const notificationRepo = database_1.AppDataSource.getRepository(notification_1.Notification);
                for (const attendee of attFound) {
                    let notification = notificationRepo.create({
                        message: `Mr/Mme. ${attendee.user.name} est convié(e) à l'evenement du ${ev.starting}`,
                        user: attendee.user, // Passing an array of users
                        title: "Invitation",
                        event: newEvent
                    });
                    try {
                        yield axios_1.default.post('https://achatthamila.app.n8n.cloud/webhook/a5c27ba5-1636-4a42-a00d-8f81755fa0ba', {
                            mail: attendee.user.email,
                            message: notification.message
                        });
                        console.log(`Message envoyé avec succès pour ${attendee.user.name}`);
                    }
                    catch (error) {
                        console.error(`Erreur lors de l'envoi du message pour ${attendee.user.name}:`, error);
                    }
                    yield notificationRepo.save(notification);
                }
                yield evRepository.save(newEvent);
                res.status(201).json(newEvent);
            }
            // Validate event configuration
            if (ev.type === "AG" && (!ev.quorum || ev.quorum <= 0 || !ev.repetitivity || ev.repetitivity === evenement_2.repetitivity.NONE)) {
                return res.status(400).json({ message: "AG not well configured" });
            }
            else if (ev.type !== "AG") {
                ev.quorum = 0;
                ev.repetitivity = evenement_2.repetitivity.NONE;
            }
            if (ev.type === "AG" && attFound.length === 0) {
                return res.status(500).json({ error: "AG type event must have at least one attendee." });
            }
            const importantAttendeesCount = attFound.filter(attendee => attendee.role === evenement_attendee_1.AttendeeRole.IMPORTANT).length;
            if (importantAttendeesCount > ((_d = ev.quorum) !== null && _d !== void 0 ? _d : 0)) {
                return res.status(500).json({ error: "Number of important attendees cannot exceed quorum." });
            }
            // Check for conflicting events
            const evRepository = database_1.AppDataSource.getRepository(evenement_1.Evenement);
            const conflictingEvents = yield evRepository
                .createQueryBuilder("event")
                .where(":starting < event.ending AND :ending > event.starting", {
                starting: ev.starting,
                ending: ev.ending,
            })
                .getMany();
            if (conflictingEvents.length > 0) {
                return res.status(409).json({ error: "Conflicting event exists" });
            }
            if (ev.isVirtual && !ev.virtualLink) {
                return res.status(409).json({ error: "Veuillez préciser le lien de réunion" });
            }
            else if (!ev.isVirtual) {
                ev.virtualLink = "";
            }
            // Create notifications for each attendee
            const notificationRepo = database_1.AppDataSource.getRepository(notification_1.Notification);
            for (const attendee of attFound) {
                const notification = notificationRepo.create({
                    message: `Mr/Mme. ${attendee.user.name} est convié(e) à l'assemblée générale du ${ev.starting}`,
                    user: attendee.user, // Passing an array of users
                    title: "Invitation"
                });
                yield notificationRepo.save(notification);
            }
            // Determine initial state based on current date
            const currentDate = new Date();
            let state = 'UNSTARTED';
            if (currentDate > ev.ending) {
                state = 'ENDED';
            }
            else if (currentDate > ev.starting && currentDate < ev.ending) {
                state = 'RUNNING';
            }
            else if (currentDate.toDateString() === new Date(ev.starting).toDateString()) {
                state = 'STARTED';
            }
            // Create and save the new event
            const newEvent = evRepository.create({
                typee: ev.type,
                description: ev.description,
                quorum: (_e = ev.quorum) !== null && _e !== void 0 ? _e : 0,
                isVirtual: ev.isVirtual,
                virtualLink: (_f = ev.virtualLink) !== null && _f !== void 0 ? _f : "",
                starting: new Date(ev.starting),
                ending: new Date(ev.ending),
                repetitivity: ev.repetitivity,
                user: userFound,
                attendees: attFound.map(att => att.user),
                location: [locFound],
                state: state
            });
            yield evRepository.save(newEvent);
            res.status(201).json(newEvent);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/evenements", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = evenement_validator_1.listEvenementValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const { page = 1, limit = 10 } = validation.value;
        try {
            const result = yield evenementUsecase.listEvenements({ page, limit });
            res.status(200).send(result);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/evenements/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const evenement = yield evenementUsecase.getEvenement(id);
            if (!evenement) {
                res.status(404).send({ error: "Evenement not found" });
                return;
            }
            res.status(200).send(evenement);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/evenements/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const validation = evenement_validator_1.evenementUpdateValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            const ev = validation.value;
            const evenement = yield evenementUsecase.updateEvenement(id, ev);
            if (!evenement) {
                res.status(404).send({ error: "Evenement not found" });
                return;
            }
            res.status(200).send(evenement);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/evenements/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const result = yield evenementUsecase.deleteEvenement(id);
            if (typeof result === 'string') {
                return res.status(404).send({ error: result });
            }
            res.status(200).send(result);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post('/missions', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { starting, ending, description, skills, userEmails, resourceIds } = req.body;
        const stepId = parseInt(req.query.StepId, 10);
        const eventId = parseInt(req.query.EventId, 10);
        try {
            const mission = yield missionUsecase.createMission(new Date(starting), new Date(ending), description, isNaN(eventId) ? null : eventId, isNaN(stepId) ? null : stepId, skills || null, userEmails || null, resourceIds || null);
            res.status(201).send(mission);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    app.get('/missions', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = mission_validator_1.listMissionValidation.validate(req.query);
        if (validation.error) {
            res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listMissionRequest = validation.value;
        let limit = 30;
        if (listMissionRequest.limit) {
            limit = listMissionRequest.limit;
        }
        const page = (_a = listMissionRequest.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const missionUsecase = new mission_usecase_1.MissionUsecase(database_1.AppDataSource);
            const { missions, totalCount } = yield missionUsecase.listMissions(Object.assign(Object.assign({}, listMissionRequest), { page, limit }));
            res.status(200).json({ missions, totalCount });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    }));
    app.get("/missions/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const mission = yield missionUsecase.getMission(id);
            if (!mission) {
                res.status(404).send({ error: "Mission not found" });
                return;
            }
            res.status(200).send(mission);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/missions/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = parseInt(req.params.id);
            const validation = mission_validator_1.missionUpdateValidation.validate(req.body);
            if (validation.error) {
                return res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            }
            const { starting, ending, description } = validation.value;
            const mission = yield missionUsecase.updateMission(id, { starting, ending, description });
            if (!mission) {
                return res.status(404).send({ error: "Mission not found" });
            }
            res.status(200).send(mission);
        }
        catch (error) {
            console.error('Error updating mission:', error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/missions/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const success = yield missionUsecase.deleteMission(id);
            if (!success) {
                res.status(404).send({ error: "Mission not found" });
                return;
            }
            res.status(200).send(success);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    // Route pour affecter des compétences requises à une mission
    app.post('/missions/:missionId/skills', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const missionId = parseInt(req.params.missionId);
        const { skillIds } = req.body;
        try {
            const mission = yield missionUsecase.addSkillsToMission(missionId, skillIds);
            res.status(200).send(mission);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post('/missions/:missionId/assign-users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const missionId = parseInt(req.params.missionId);
        const { userEmails } = req.body;
        try {
            const mission = yield missionUsecase.assignUsersToMission(missionId, userEmails);
            if (typeof mission === "string") {
                res.status(400).send({ error: mission });
            }
            else {
                res.status(200).send(mission);
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    app.get('/missions/:missionId/users-by-skills', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const missionId = parseInt(req.params.missionId);
        try {
            const users = yield missionUsecase.getUsersByMissionSkills(missionId);
            res.status(200).send(users);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post('/resources', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = ressource_validator_1.resourceValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const resourceUsecase = new ressource_usecase_1.ResourceUsecase(database_1.AppDataSource);
        const { name, type, isAvailable } = validation.value;
        try {
            const newResource = yield resourceUsecase.createResource(name, type, isAvailable);
            res.status(201).send(newResource);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    app.post('/missions/:id/resources', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { resourceIds } = req.body;
        const validation = ressource_validator_1.assignResourceToMissionValidation.validate({ missionId: id, resourceIds });
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const resourceUsecase = new ressource_usecase_1.ResourceUsecase(database_1.AppDataSource);
        try {
            const result = yield resourceUsecase.assignResourcesToMission(parseInt(id), resourceIds);
            if (typeof result === 'string') {
                res.status(400).send({ error: result });
            }
            else {
                res.status(200).send(result);
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    app.post('/missions/:id/release-resources', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const resourceUsecase = new ressource_usecase_1.ResourceUsecase(database_1.AppDataSource);
        try {
            const mission = yield resourceUsecase.releaseResourcesFromMission(parseInt(id));
            res.status(200).send(mission);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    app.get('/resources/available', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const resourceUsecase = new ressource_usecase_1.ResourceUsecase(database_1.AppDataSource);
        try {
            const availableResources = yield resourceUsecase.getAvailableResources();
            res.status(200).send(availableResources);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    // Route pour obtenir les ressources associées à une mission
    app.get('/missions/:id/resources', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const resourceUsecase = new ressource_usecase_1.ResourceUsecase(database_1.AppDataSource);
        try {
            const missionResources = yield resourceUsecase.getResourcesByMission(parseInt(id));
            res.status(200).send(missionResources);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    app.get('/resources', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const resourceUsecase = new ressource_usecase_1.ResourceUsecase(database_1.AppDataSource);
        try {
            const allResources = yield resourceUsecase.getAllResources();
            res.status(200).send(allResources);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    app.patch('/resources/:id', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const updateData = req.body;
        const resourceUsecase = new ressource_usecase_1.ResourceUsecase(database_1.AppDataSource);
        try {
            const updatedResource = yield resourceUsecase.updateResource(parseInt(id), updateData);
            if (updatedResource) {
                res.status(200).send(updatedResource);
            }
            else {
                res.status(404).send({ error: 'Resource not found' });
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Internal error' });
        }
    }));
    app.post("/projets", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Request body:", req.body);
        const validation = projet_validator_1.projetValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const project = validation.value;
        project.userId = req.userId;
        console.log("Project data with user ID:", project);
        try {
            const projetCreated = yield projetUsecase.createProjet(project);
            res.status(201).send(projetCreated);
        }
        catch (error) {
            console.log("Error creating project:", error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/projets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = projet_validator_1.listProjetValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const { page = 1, limit = 20 } = validation.value;
        try {
            const result = yield projetUsecase.listProjets({ page, limit });
            res.status(200).send(result);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/projets/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const projet = yield projetUsecase.getProjet(id);
            if (!projet) {
                res.status(404).send({ error: "Projet not found" });
                return;
            }
            res.status(200).send(projet);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/projets/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        const validation = projet_validator_1.projetUpdateValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const proj = validation.value;
        try {
            const projet = yield projetUsecase.updateProjet(id, Object.assign({}, proj));
            if (!projet) {
                res.status(404).send({ error: "Projet not found" });
                return;
            }
            res.status(200).send(projet);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/projets/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const success = yield projetUsecase.deleteProjet(id);
            if (!success) {
                res.status(404).send({ error: "Projet not found" });
                return;
            }
            res.status(200).send(success);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post("/steps", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = step_validator_1.stepValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const { state, description, starting, ending, projetId } = validation.value;
        try {
            const stepCreated = yield stepUsecase.createStep(state, description, starting, ending, projetId);
            res.status(201).send(stepCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/steps", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = step_validator_1.listStepValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const { page = 1, limit = 20 } = validation.value;
        try {
            const result = yield stepUsecase.listSteps({ page, limit });
            res.status(200).send(result);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/steps/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const step = yield stepUsecase.getStep(id);
            if (!step) {
                res.status(404).send({ error: "Step not found" });
                return;
            }
            res.status(200).send(step);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/steps/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        const validation = step_validator_1.stepUpdateValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const { state, description, starting, ending, projetId } = validation.value;
        try {
            const step = yield stepUsecase.updateStep(id, { state, description, starting, ending, projetId });
            if (!step) {
                res.status(404).send({ error: "Step not found" });
                return;
            }
            res.status(200).send(step);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/steps/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const success = yield stepUsecase.deleteStep(id);
            if (!success) {
                res.status(404).send({ error: "Step not found" });
                return;
            }
            res.status(200).send(success);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    app.post("/comments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = review_validator_1.reviewValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const { content, createdAt, missionId, userId } = validation.value;
        try {
            const reviewCreated = yield reviewUsecase.createReview(content, createdAt, missionId, userId);
            res.status(201).send(reviewCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/comments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const review = yield reviewUsecase.getReview(id);
            if (!review) {
                res.status(404).send({ error: "Review not found" });
                return;
            }
            res.status(200).send(review);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/comments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        const validation = review_validator_1.reviewValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const { content } = validation.value;
        try {
            const review = yield reviewUsecase.updateReview(id, { content });
            if (!review) {
                res.status(404).send({ error: "Review not found" });
                return;
            }
            res.status(200).send(review);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/comments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const success = yield reviewUsecase.deleteReview(id);
            if (!success) {
                res.status(404).send({ error: "Review not found" });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Routes for Subject
    // app.post("/subjects",adminMiddleware, async (req: Request, res: Response) => {
    //     const validation = createSubjectValidation.validate(req.body);
    //     if (validation.error) {
    //         res.status(400).send(generateValidationErrorMessage(validation.error.details));
    //         return;
    //     }
    //     try {
    //         const subjectCreated = await subjectUsecase.createSubject(validation.value);
    //         res.status(201).send(subjectCreated);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.get("/subjects", async (req: Request, res: Response) => {
    //     const { page = 1, limit = 10 } = req.query;
    //     try {
    //         const result = await subjectUsecase.listSubjects({ page: Number(page), limit: Number(limit) });
    //         res.status(200).send(result);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.get("/subjects/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     try {
    //         const subject = await subjectUsecase.getSubject(id);
    //         if (!subject) {
    //             res.status(404).send({ error: "Subject not found" });
    //             return;
    //         }
    //         res.status(200).send(subject);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.patch("/subjects/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     const validation = updateSubjectValidation.validate(req.body);
    //     if (validation.error) {
    //         res.status(400).send(generateValidationErrorMessage(validation.error.details));
    //         return;
    //     }
    //     try {
    //         const subject = await subjectUsecase.updateSubject(id, validation.value);
    //         if (!subject) {
    //             res.status(404).send({ error: "Subject not found" });
    //             return;
    //         }
    //         res.status(200).send(subject);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.delete("/subjects/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     try {
    //         const success = await subjectUsecase.deleteSubject(id);
    //         if (!success) {
    //             res.status(404).send({ error: "Subject not found" });
    //             return;
    //         }
    //         res.status(200).send(success);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // Routes for Vote
    // app.post("/votes", async (req: Request, res: Response) => {
    //     const validation = createVoteValidation.validate(req.body);
    //     if (validation.error) {
    //         res.status(400).send(generateValidationErrorMessage(validation.error.details));
    //         return;
    //     }
    //     try {
    //         const voteCreated = await voteUsecase.createVote(validation.value);
    //         res.status(201).send(voteCreated);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.get("/votes", async (req: Request, res: Response) => {
    //     const { page = 1, limit = 10 } = req.query;
    //     try {
    //         const result = await voteUsecase.listVotes({ page: Number(page), limit: Number(limit) });
    //         res.status(200).send(result);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.get("/votes/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     try {
    //         const vote = await voteUsecase.getVote(id);
    //         if (!vote) {
    //             res.status(404).send({ error: "Vote not found" });
    //             return;
    //         }
    //         res.status(200).send(vote);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.patch("/votes/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     const validation = updateVoteValidation.validate(req.body);
    //     if (validation.error) {
    //         res.status(400).send(generateValidationErrorMessage(validation.error.details));
    //         return;
    //     }
    //     try {
    //         const vote = await voteUsecase.updateVote(id, validation.value);
    //         if (!vote) {
    //             res.status(404).send({ error: "Vote not found" });
    //             return;
    //         }
    //         res.status(200).send(vote);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.delete("/votes/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     try {
    //         const success = await voteUsecase.deleteVote(id);
    //         if (!success) {
    //             res.status(404).send({ error: "Vote not found" });
    //             return;
    //         }
    //         res.status(200).send(success);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.get("/votes/subject/:subjectId", async (req: Request, res: Response) => {
    //     const subjectId = parseInt(req.params.subjectId);
    //     try {
    //         const votes = await voteUsecase.getVotesBySubject(subjectId);
    //         res.status(200).send(votes);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // // Routes for Response
    // app.post("/responses", async (req: Request, res: Response) => {
    //     const validation = createResponseValidation.validate(req.body);
    //     if (validation.error) {
    //         res.status(400).send(generateValidationErrorMessage(validation.error.details));
    //         return;
    //     }
    //     try {
    //         const responseCreated = await responseUsecase.createResponse(validation.value);
    //         res.status(201).send(responseCreated);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.get("/responses", async (req: Request, res: Response) => {
    //     const { page = 1, limit = 10 } = req.query;
    //     try {
    //         const result = await responseUsecase.listResponses({ page: Number(page), limit: Number(limit) });
    //         res.status(200).send(result);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.get("/responses/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     try {
    //         const response = await responseUsecase.getResponse(id);
    //         if (!response) {
    //             res.status(404).send({ error: "Response not found" });
    //             return;
    //         }
    //         res.status(200).send(response);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.patch("/responses/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     const validation = updateResponseValidation.validate(req.body);
    //     if (validation.error) {
    //         res.status(400).send(generateValidationErrorMessage(validation.error.details));
    //         return;
    //     }
    //     try {
    //         const response = await responseUsecase.updateResponse(id, validation.value);
    //         if (!response) {
    //             res.status(404).send({ error: "Response not found" });
    //             return;
    //         }
    //         res.status(200).send(response);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.delete("/responses/:id", async (req: Request, res: Response) => {
    //     const id = parseInt(req.params.id);
    //     try {
    //         const success = await responseUsecase.deleteResponse(id);
    //         if (!success) {
    //             res.status(404).send({ error: "Response not found" });
    //             return;
    //         }
    //         res.status(200).send(success);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    // app.get("/responses/user/:userId", async (req: Request, res: Response) => {
    //     const userId = parseInt(req.params.userId);
    //     try {
    //         const responses = await responseUsecase.getResponsesByUser(userId);
    //         res.status(200).send(responses);
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).send({ error: "Internal error" });
    //     }
    // });
    app.post('/vote', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const validation = vote_validator_1.voteValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            const vote = validation.value;
            const voteCreated = yield voteUsecase.createVotee(vote, (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            res.status(201).send(voteCreated);
        }
        catch (error) {
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/votes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = projet_validator_1.listProjetValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const { page = 1, limit = 10 } = validation.value;
        try {
            const result = yield voteUsecase.listVotes({ page, limit });
            res.status(200).send(result);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/vote:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.id);
        try {
            const success = yield voteUsecase.deleteVote(id);
            if (!success) {
                res.status(404).send({ error: "Vote not found" });
                return;
            }
            res.status(200).send(success);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post('/round', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validation = round_validator_1.roundValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            const round = validation.value;
            const roundCreated = yield roundUsecase.createRound(round.description, round.starting, round.ending, round.voteId);
            res.status(201).send(roundCreated);
        }
        catch (error) {
            if (error === 'Vote not found' ||
                error === 'Round dates must be within the vote dates' ||
                error === 'There is already a round planned for the same vote during this period' ||
                error === 'A round with the same starting and ending dates already exists for this vote') {
                res.status(400).send({ error: error });
            }
            else {
                res.status(500).send({ error: error });
            }
        }
    }));
    app.get('/rounds/:voteId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.voteId);
        try {
            const rounds = yield roundUsecase.getRounds(id);
            if (!rounds) {
                res.status(404).send({ error: "Rounds not found" });
                return;
            }
            res.status(200).send(rounds);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete('/rounds/:roundId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.roundId);
        try {
            const round = yield roundUsecase.deleteRound(id);
            if (!round) {
                res.status(404).send({ error: "Round not found" });
                return;
            }
            res.status(200).send(round);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post('/proposition', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validation = proposition_validator_1.propositionValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            const proposition = validation.value;
            const propositionCreated = yield propositionUsecase.createProposition(proposition);
            res.status(201).send(propositionCreated);
        }
        catch (error) {
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get('/propositions/:roundId', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const id = parseInt(req.params.roundId);
        try {
            const propositions = yield propositionUsecase.getPropositions(id);
            if (!propositions) {
                res.status(404).send({ error: "Rounds not found" });
                return;
            }
            res.status(200).send(propositions);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete('/proposition/:id', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const propositionId = parseInt(req.params.id, 10);
            const result = yield propositionUsecase.deleteProposition(propositionId);
            if (result === "Proposition deleted successfully") {
                res.status(200).send(result);
            }
            else {
                res.status(404).send(result);
            }
        }
        catch (error) {
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post('/choice', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const validation = proposition_validator_1.choiceValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            const { choice, roundId } = validation.value;
            const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token)
                return res.status(401).json({ "error": "Unauthorized" });
            // Trouver le token dans le référentiel des tokens avec la relation utilisateur
            const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
            const tokenFound = yield tokenRepo.findOne({ where: { token }, relations: ['user'] });
            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }
            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error" });
            }
            // Trouver l'utilisateur associé au token
            const userRepo = database_1.AppDataSource.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id } });
            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error" });
            }
            const userId = userFound.id; // Assuming you have user authentication and user ID is available in req.user
            const voteRecordRepository = database_1.AppDataSource.getRepository(vote_record_1.VoteRecord);
            const propositionRepository = database_1.AppDataSource.getRepository(proposition_1.Proposition);
            // Check if the user has already voted in this round
            const existingVote = yield voteRecordRepository.findOne({
                where: {
                    user: { id: userId },
                    round: { id: roundId }
                }
            });
            if (existingVote) {
                res.status(400).send({ error: "You have already voted in this round." });
                return;
            }
            // Search for the proposition
            const proposition = yield propositionRepository.findOne({
                where: {
                    description: choice,
                    round: { id: roundId }
                },
                relations: ['round']
            });
            if (!proposition) {
                res.status(404).send({ error: "Proposition not found" });
                return;
            }
            // Update the proposition if needed
            proposition.voices += 1;
            yield propositionRepository.save(proposition);
            // Create a new vote record
            const voteRecord = new vote_record_1.VoteRecord();
            voteRecord.user = { id: userId }; // Replace with actual user entity if needed
            voteRecord.round = { id: roundId }; // Replace with actual round entity if needed
            voteRecord.choice = choice;
            yield voteRecordRepository.save(voteRecord);
            res.status(201).send(proposition);
        }
        catch (error) {
            console.error("Internal error:", error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post('/upload', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const buffer = Buffer.from(file.buffer);
            const readableStream = new stream_1.Readable();
            readableStream._read = () => { }; // No-op
            readableStream.push(buffer);
            readableStream.push(null);
            const fileId = yield documentUsecase.uploadFileToGoogleDrive(file.originalname, file.mimetype, readableStream);
            const docRepo = database_1.AppDataSource.getRepository(document_1.Document);
            const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token)
                return res.status(401).json({ "error": "Unauthorized" });
            // Trouver le token dans le référentiel des tokens avec la relation utilisateur
            const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
            const tokenFound = yield tokenRepo.findOne({ where: { token }, relations: ['user'] });
            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }
            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error" });
            }
            // Trouver l'utilisateur associé au token
            const userRepo = database_1.AppDataSource.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id } });
            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error" });
            }
            const newDocument = docRepo.create({
                title: file.originalname,
                description: "...",
                type: file.mimetype,
                fileId: fileId,
                user: userFound
            });
            docRepo.save(newDocument);
            res.json({ newDocument });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        }
    }));
    app.get('/download/:fileId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { fileId } = req.params;
            const fileStream = yield documentUsecase.getGoogleDriveFile(fileId);
            fileStream.pipe(res);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        }
    }));
    app.get('/document', combMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Récupérer le token d'autorisation des en-têtes de la requête
            const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token)
                return res.status(401).json({ "error": "Unauthorized" });
            // Trouver le token dans le référentiel des tokens avec la relation utilisateur
            const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
            const tokenFound = yield tokenRepo.findOne({ where: { token }, relations: ['user'] });
            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }
            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error" });
            }
            // Trouver l'utilisateur associé au token
            const userRepo = database_1.AppDataSource.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id } });
            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error" });
            }
            // Trouver tous les documents associés à l'utilisateur trouvé
            const docRepo = database_1.AppDataSource.getRepository(document_1.Document);
            const docs = yield docRepo.find({ where: { user: { id: userFound.id } } });
            // Retourner les documents trouvés
            return res.send(docs);
        }
        catch (error) {
            // Gestion des erreurs inattendues
            console.error('An unexpected error occurred:', error);
            return res.status(500).json({ "error": "Internal server error" });
        }
    }));
    app.post('/notes', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.user.id;
        const result = yield noteUsecase.createNote(userId, {
            name: req.body.name,
            content: req.body.content,
            date: req.body.date
        });
        if (typeof result === 'string') {
            return res.status(400).json({ message: result });
        }
        res.status(201).json(result);
    }));
    app.get('/notes', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.user.id;
        const notes = yield noteUsecase.listNotes(userId);
        res.status(200).json(notes);
    }));
    app.get('/notes/:id', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.user.id;
        const id = parseInt(req.params.id);
        const note = yield noteUsecase.getNoteById(id, userId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.status(200).json(note);
    }));
    app.patch('/notes/:id', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.user.id;
        const id = parseInt(req.params.id);
        const result = yield noteUsecase.updateNote(id, userId, req.body);
        if (typeof result === 'string') {
            return res.status(400).json({ message: result });
        }
        res.status(200).json(result);
    }));
    app.delete('/notes/:id', admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.user.id;
        const id = parseInt(req.params.id);
        const success = yield noteUsecase.deleteNote(id, userId);
        if (!success) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.status(204).send();
    }));
    app.post("/skills", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { error } = skill_validator_1.skillValidation.validate(req.body);
        if (error) {
            return res.status(400).send({ error: error.details[0].message });
        }
        try {
            const skill = yield skillUsecase.createSkill(req.body.name);
            res.status(201).send(skill);
        }
        catch (err) {
            res.status(500).send({ error: "Internal Server Error" });
        }
    }));
    app.get("/skills/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const skill = yield skillUsecase.getSkill(parseInt(req.params.id));
            if (!skill) {
                return res.status(404).send({ error: "Skill not found" });
            }
            res.status(200).send(skill);
        }
        catch (err) {
            res.status(500).send({ error: "Internal Server Error" });
        }
    }));
    app.get("/skills", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const skills = yield skillUsecase.listSkills();
            res.status(200).send(skills);
        }
        catch (err) {
            res.status(500).send({ error: "Internal Server Error" });
        }
    }));
    app.patch("/skills/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { error } = skill_validator_1.skillValidation.validate(req.body);
        if (error) {
            return res.status(400).send({ error: error.details[0].message });
        }
        try {
            const skill = yield skillUsecase.updateSkill(parseInt(req.params.id), req.body.name);
            if (!skill) {
                return res.status(404).send({ error: "Skill not found" });
            }
            res.status(200).send(skill);
        }
        catch (err) {
            res.status(500).send({ error: "Internal Server Error" });
        }
    }));
    app.delete("/skills/:id", admin_middleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const success = yield skillUsecase.deleteSkill(parseInt(req.params.id));
            if (!success) {
                return res.status(404).send({ error: "Skill not found" });
            }
            res.status(204).send();
        }
        catch (err) {
            res.status(500).send({ error: "Internal Server Error" });
        }
    }));
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Route pour lister les notifications
    app.get('/notifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { limit = 10, page = 1 } = req.query;
        try {
            const result = yield notificationUsecase.listNotifications({ limit: Number(limit), page: Number(page) });
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }));
    // Route pour créer une notification
    app.post('/notifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { title, message, userId } = req.body;
        try {
            const result = yield notificationUsecase.createNotification({ title, message, userId });
            if (typeof result === 'string') {
                return res.status(404).json({ error: result });
            }
            res.status(201).json(result);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }));
    // Route pour obtenir une notification spécifique
    app.get('/notifications/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const result = yield notificationUsecase.getNotification(Number(id));
            if (!result) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }));
    app.patch('/notifications/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { title, message, accepted } = req.body;
        try {
            const result = yield notificationUsecase.updateNotification(Number(id), { title, message, accepted });
            if (!result) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }));
    app.delete('/notifications/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const result = yield notificationUsecase.deleteNotification(Number(id));
            if (!result) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.status(200).json({ message: 'Notification deleted' });
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error", error: error });
        }
    }));
    app.get('/users/:userId/notifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params;
        try {
            const notifications = yield notificationUsecase.getNotificationsByUser(Number(userId));
            res.status(200).json(notifications);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error });
        }
    }));
};
exports.initRoutes = initRoutes;
