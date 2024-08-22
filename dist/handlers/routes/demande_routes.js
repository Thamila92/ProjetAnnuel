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
exports.initDemandeRoutes = void 0;
const demande_usecase_1 = require("../../domain/demande-usecase");
const database_1 = require("../../database/database");
const demande_validator_1 = require("../validators/demande-validator");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const initDemandeRoutes = (app) => {
    const demandeUsecase = new demande_usecase_1.DemandeUsecase(database_1.AppDataSource);
    // CREATE une nouvelle demande
    app.post('/demandes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = demande_validator_1.demandeValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield demandeUsecase.createDemande(validationResult.value);
            res.status(201).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // LIST toutes les demandes
    app.get('/demandes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield demandeUsecase.listDemandes();
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // READ une demande par ID
    app.get('/demandes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield demandeUsecase.getDemande(Number(req.params.id));
            if (!result) {
                res.status(404).json({ error: "Demande not found" });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // UPDATE une demande par ID
    // UPDATE une demande par ID
    app.patch('/demandes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Valider les données d'entrée
            const validationResult = demande_validator_1.demandeValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            // Appeler le cas d'utilisation pour mettre à jour la demande
            const result = yield demandeUsecase.updateDemande(Number(req.params.id), validationResult.value);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else if (!result) {
                res.status(404).json({ error: "Demande not found" });
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // DELETE une demande par ID
    app.delete('/demandes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield demandeUsecase.deleteDemande(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(404).json({ error: result });
            }
            else {
                res.status(200).json({ message: "Demande deleted successfully", demande: result });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
};
exports.initDemandeRoutes = initDemandeRoutes;
