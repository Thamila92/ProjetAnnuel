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
exports.initStatusRoutes = void 0;
const status_usecase_1 = require("../../domain/status-usecase");
const database_1 = require("../../database/database");
const status_validator_1 = require("../validators/status-validator");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const initStatusRoutes = (router) => {
    const statusUsecase = new status_usecase_1.StatusUsecase(database_1.AppDataSource);
    // CREATE a new status
    router.post('/statuses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = status_validator_1.createStatusValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield statusUsecase.createStatus(validationResult.value);
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
    // READ/List all statuses
    router.get('/statuses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statuses = yield statusUsecase.listStatuses();
            res.status(200).json(statuses);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // READ/Get one status by ID
    router.get('/statuses/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = status_validator_1.statusIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const status = yield statusUsecase.getStatusById(Number(req.params.id));
            if (!status) {
                res.status(404).json({ error: "Status not found" });
            }
            else {
                res.status(200).json(status);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
    // UPDATE a status
    router.patch('/statuses/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = status_validator_1.updateStatusValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield statusUsecase.updateStatus(Number(req.params.id), validationResult.value);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else if (!result) {
                res.status(404).json({ error: "Status not found" });
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
    // DELETE a status
    router.delete('/statuses/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = status_validator_1.statusIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const result = yield statusUsecase.deleteStatus(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            }
            else {
                res.status(200).json({ message: "Status deleted successfully", status: result });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    }));
};
exports.initStatusRoutes = initStatusRoutes;
