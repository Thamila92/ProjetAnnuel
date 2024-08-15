"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEvenementsValidation = exports.evenementIdValidation = exports.evenementUpdateValidation = exports.evenementValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const event_types_1 = require("../../types/event-types");
exports.evenementValidation = joi_1.default.object({
    type: joi_1.default.string().valid(...Object.values(event_types_1.eventtype)).required(),
    attendees: joi_1.default.array().items(joi_1.default.object({
        userId: joi_1.default.number().integer().required(),
        role: joi_1.default.string().valid(...Object.values(event_types_1.AttendeeRole)).default(event_types_1.AttendeeRole.NORMAL).required(),
    })).default([]),
    description: joi_1.default.string().required(),
    quorum: joi_1.default.number().default(0),
    isVirtual: joi_1.default.boolean().required(),
    virtualLink: joi_1.default.string().allow('', null).optional(),
    location: joi_1.default.string().required(),
    starting: joi_1.default.date().iso().min('now').required(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).required(),
    repetitivity: joi_1.default.string().valid(...Object.values(event_types_1.repetitivity)).default(event_types_1.repetitivity.NONE),
    maxParticipants: joi_1.default.number().integer().positive().required(),
    currentParticipants: joi_1.default.number().integer().min(0).default(0).optional(),
    membersOnly: joi_1.default.boolean().default(false)
}).options({ abortEarly: false });
exports.evenementUpdateValidation = joi_1.default.object({
    type: joi_1.default.string().valid(...Object.values(event_types_1.eventtype)).optional(),
    location: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    quorum: joi_1.default.number().optional(),
    isVirtual: joi_1.default.boolean().optional(),
    virtualLink: joi_1.default.string().allow('', null).optional(),
    starting: joi_1.default.date().iso().min('now').optional(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).optional(),
    repetitivity: joi_1.default.string().valid(...Object.values(event_types_1.repetitivity)).optional(),
    maxParticipants: joi_1.default.number().integer().positive().optional(),
    currentParticipants: joi_1.default.number().integer().positive().optional(), // Ajoutez ceci
    membersOnly: joi_1.default.boolean().optional() // Ajoutez ceci
}).options({ abortEarly: false });
exports.evenementIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
}).options({ abortEarly: false });
exports.listEvenementsValidation = joi_1.default.object({
    limit: joi_1.default.number().min(1).optional(),
    page: joi_1.default.number().min(1).optional(),
}).options({ abortEarly: false });
