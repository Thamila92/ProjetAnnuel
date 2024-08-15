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
exports.initEvenementRoutes = void 0;
const evenement_usecase_1 = require("../../domain/evenement-usecase");
const database_1 = require("../../database/database");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const evenement_validator_1 = require("../validators/evenement-validator");
const initEvenementRoutes = (app) => {
    const evenementUsecase = new evenement_usecase_1.EvenementUsecase(database_1.AppDataSource);
    // CREATE a new evenement
    app.post('/evenements', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = evenement_validator_1.evenementValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield evenementUsecase.createEvenement(validationResult.value);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(201).json(result);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // READ/List all evenements
    app.get('/evenements', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = evenement_validator_1.listEvenementsValidation.validate(req.query);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield evenementUsecase.listEvenements(validationResult.value);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // READ/Find an evenement by ID
    app.get('/evenements/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = evenement_validator_1.evenementIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield evenementUsecase.getEvenement(Number(req.params.id));
            if (!result) {
                res.status(404).json({ error: "Event not found" });
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
    // UPDATE an evenement
    app.patch('/evenements/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = evenement_validator_1.evenementUpdateValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield evenementUsecase.updateEvenement(Number(req.params.id), validationResult.value);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else if (!result) {
                res.status(404).json({ error: "Event not found" });
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
    // DELETE an evenement
    app.delete('/evenements/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = evenement_validator_1.evenementIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield evenementUsecase.deleteEvenement(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json({ message: "Event deleted successfully", event: result });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
};
exports.initEvenementRoutes = initEvenementRoutes;
