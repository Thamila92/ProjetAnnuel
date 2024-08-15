"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMissionsValidation = exports.missionIdValidation = exports.missionUpdateValidation = exports.missionCreateValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.missionCreateValidation = joi_1.default.object({
    starting: joi_1.default.date().iso().min('now').required(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).required(),
    description: joi_1.default.string().required(),
    skills: joi_1.default.array().items(joi_1.default.string()).optional(),
    userEmails: joi_1.default.array().items(joi_1.default.string().email()).optional(),
    resourceIds: joi_1.default.array().items(joi_1.default.number().required()).optional(),
}).options({ abortEarly: false });
exports.missionUpdateValidation = joi_1.default.object({
    starting: joi_1.default.date().iso().min('now').optional(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).optional(),
    description: joi_1.default.string().optional(),
    skills: joi_1.default.array().items(joi_1.default.string()).optional(),
    userEmails: joi_1.default.array().items(joi_1.default.string().email()).optional(),
    resources: joi_1.default.array().items(joi_1.default.number().required()).optional(),
}).options({ abortEarly: false });
exports.missionIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
}).options({ abortEarly: false });
exports.listMissionsValidation = joi_1.default.object({
    limit: joi_1.default.number().integer().min(1).default(10),
    page: joi_1.default.number().integer().min(1).default(1),
}).options({ abortEarly: false });
