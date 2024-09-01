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
exports.initUserRoutes = void 0;
const database_1 = require("../../database/database");
const user_usecase_1 = require("../../domain/user-usecase");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const user_validator_1 = require("../validators/user-validator");
const jsonwebtoken_1 = require("jsonwebtoken");
const initUserRoutes = (app) => {
    const userUsecase = new user_usecase_1.UserUsecase(database_1.AppDataSource);
    // Inscription Adhérent
    app.post('/adherent/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Données reçues pour l'inscription :", req.body);
            const validationResult = user_validator_1.createAdherentValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createAdherentRequest = validationResult.value;
            const result = yield userUsecase.createAdherent(createAdherentRequest);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(201).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    app.post('/salarier/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Données reçues pour l'inscription :", req.body);
            const validationResult = user_validator_1.createSalarierValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createSalarierRequest = validationResult.value;
            const result = yield userUsecase.createSalarier(createSalarierRequest);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(201).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    app.get('/getUserEvenementAttendees/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = Number(req.params.id);
            const result = yield userUsecase.getUserEvenementAttendees(userId);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    app.get('/getUserDemandes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = Number(req.params.id);
            const result = yield userUsecase.getUserDemandes(userId);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    // Inscription Administrateur
    app.post('/admin/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.createAdminValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const createAdminRequest = validationResult.value;
            const result = yield userUsecase.createAdmin(createAdminRequest);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(201).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    // Connexion (commun pour Adhérent et Administrateur)
    app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.loginOtherValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const { email, password } = validationResult.value;
            const result = yield userUsecase.loginUser(email, password);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    // Mise à jour d'un utilisateur
    app.patch('/updateUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.updateUserValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const updateUserRequest = validationResult.value;
            const result = yield userUsecase.updateUser(Number(req.params.id), updateUserRequest);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    // Bannir un utilisateur
    app.post('/banUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield userUsecase.banUser(Number(req.params.id));
            if (result.success) {
                res.status(200).json({ message: result.message });
            }
            else {
                res.status(400).json({ error: result.message });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // Lister les utilisateurs
    app.get('/listUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = user_validator_1.listUsersValidation.validate(req.query);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const filter = validationResult.value;
            const result = yield userUsecase.listUser(filter);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    app.delete('/deleteUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = parseInt(req.params.id, 10);
            const result = yield userUsecase.deleteUser(userId);
            if (result === "Utilisateur non trouvé") {
                res.status(404).json({ error: result });
            }
            else {
                res.status(200).json({ message: result });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Erreur interne, veuillez réessayer plus tard." });
        }
    }));
    // Récupérer un utilisateur par ID
    app.get('/getUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield userUsecase.getUserById(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    app.patch('/UpdatePwd/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId } = req.params; // ID de l'utilisateur extrait de l'URL
        const { oldPassword, newPassword } = req.body; // Mots de passe extraits du corps de la requête
        // Convertir userId en nombre si nécessaire
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required." });
        }
        try {
            const result = yield userUsecase.changePassword(numericUserId, oldPassword, newPassword);
            if (result === "Password updated successfully") {
                res.status(200).json({ message: result });
            }
            else {
                res.status(400).json({ message: result });
            }
        }
        catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }));
    // Ajouter une compétence à un utilisateur
    app.post('/addSkillToUser/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const skillName = req.body.skillName;
            if (!skillName) {
                res.status(400).json({ error: "Skill name is required" });
                return;
            }
            const result = yield userUsecase.addSkillToUser(Number(req.params.id), skillName);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    // Récupérer les utilisateurs par rôle
    app.get('/getUsersByRole/:role', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const role = req.params.role;
            const result = yield userUsecase.getUsersByRole(role);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    // Récupérer les utilisateurs disponibles par statut
    app.get('/getAvailableUsersByStatus/:status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const status = req.params.status;
            const result = yield userUsecase.getAvailableUsersByStatus(status);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    app.get('/getUsersByStatus/:status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const status = req.params.status;
            const result = yield userUsecase.getUsersByStatus(status);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    // Récupérer tous les utilisateurs disponibles
    app.get('/getAllUsersAvailable', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield userUsecase.getAllUsersAvailable();
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    // Récupérer tous les utilisateurs
    app.get('/getAllUsers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield userUsecase.getAllUsers();
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    }));
    //retourne user actuel
    app.get('/auth/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const secret = (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : "NoNotThis";
            const decoded = (0, jsonwebtoken_1.verify)(token, secret);
            const userId = decoded.userId;
            const result = yield userUsecase.getCurrentUser(userId);
            if (typeof result === 'string') {
                res.status(404).json({ error: result });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error("Failed to fetch user details:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }));
};
exports.initUserRoutes = initUserRoutes;
