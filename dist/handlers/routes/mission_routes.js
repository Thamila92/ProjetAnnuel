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
exports.initMissionRoutes = void 0;
const mission_usecase_1 = require("../../domain/mission-usecase");
const database_1 = require("../../database/database");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const mission_validator_1 = require("../validators/mission-validator");
const initMissionRoutes = (app) => {
    const missionUsecase = new mission_usecase_1.MissionUsecase(database_1.AppDataSource);
    // CREATE a new mission
    app.post('/missions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = mission_validator_1.missionCreateValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const { starting, ending, description, skills, userEmails, resources } = validationResult.value;
            const result = yield missionUsecase.createMission(starting, ending, description, skills, userEmails, resources);
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
    // READ/List all missions
    app.get('/missions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = mission_validator_1.listMissionsValidation.validate(req.query);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield missionUsecase.listMissions(validationResult.value);
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // READ/Find a mission by ID
    app.get('/missions/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = mission_validator_1.missionIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield missionUsecase.getMission(Number(req.params.id));
            if (!result) {
                res.status(404).json({ error: "Mission not found" });
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
    // UPDATE a mission
    // PATCH a mission
    app.patch('/missions/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = mission_validator_1.missionUpdateValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield missionUsecase.updateMission(Number(req.params.id), validationResult.value);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else if (!result) {
                res.status(404).json({ error: "Mission not found" });
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
    // DELETE a mission
    app.delete('/missions/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = mission_validator_1.missionIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield missionUsecase.deleteMission(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else if (!result) {
                res.status(404).json({ error: "Mission not found" });
            }
            else {
                res.status(200).json({ message: "Mission deleted successfully", mission: result });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
};
exports.initMissionRoutes = initMissionRoutes;
