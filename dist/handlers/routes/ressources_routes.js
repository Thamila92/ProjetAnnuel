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
exports.initResourceRoutes = void 0;
const database_1 = require("../../database/database");
const ressource_usecase_1 = require("../../domain/ressource-usecase");
const ressource_validator_1 = require("../validators/ressource-validator");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const initResourceRoutes = (app) => {
    const resourceUsecase = new ressource_usecase_1.ResourceUsecase(database_1.AppDataSource);
    // CREATE a new resource
    app.post('/resources', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = ressource_validator_1.resourceValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const { name, type, isAvailable } = validationResult.value;
            const newResource = yield resourceUsecase.createResource(name, type, isAvailable);
            res.status(201).json(newResource);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // UPDATE a resource
    // PATCH a resource
    app.patch('/resources/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = ressource_validator_1.resourceValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const updatedResource = yield resourceUsecase.updateResource(Number(req.params.id), validationResult.value);
            if (!updatedResource) {
                res.status(404).json({ error: "Resource not found" });
            }
            else {
                res.status(200).json(updatedResource);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // GET all available resources
    app.get('/resources/available', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const availableResources = yield resourceUsecase.getAvailableResources();
            res.status(200).json(availableResources);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // GET resources by mission ID
    app.get('/missions/:missionId/resources', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const resources = yield resourceUsecase.getResourcesByMission(Number(req.params.missionId));
            res.status(200).json(resources);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // ASSIGN resources to a mission
    app.post('/missions/:missionId/resources', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { resourceIds } = req.body;
            const result = yield resourceUsecase.assignResourcesToMission(Number(req.params.missionId), resourceIds);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
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
    // RELEASE resources from a mission
    app.delete('/missions/:missionId/resources', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield resourceUsecase.releaseResourcesFromMission(Number(req.params.missionId));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
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
    // CLEAN UP expired availabilities
    app.post('/resources/cleanup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield resourceUsecase.cleanUpExpiredAvailabilities();
            res.status(200).json({ message: "Expired availabilities cleaned up" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // GET all resources
    app.get('/resources', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const allResources = yield resourceUsecase.getAllResources();
            res.status(200).json(allResources);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    app.delete('/resources/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const deleted = yield resourceUsecase.deleteResource(Number(req.params.id));
            if (!deleted) {
                res.status(404).json({ error: "Resource not found" });
            }
            else {
                res.status(200).json({ message: "Resource deleted successfully" });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
};
exports.initResourceRoutes = initResourceRoutes;
