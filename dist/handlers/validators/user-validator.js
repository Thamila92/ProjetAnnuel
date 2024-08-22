"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersValidation = exports.updateUserValidation = exports.loginOtherValidation = exports.createAdminValidation = exports.createAdherentValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createAdherentValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    skills: joi_1.default.array().items(joi_1.default.string()).optional(),
}).options({ abortEarly: false });
exports.createAdminValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    key: joi_1.default.string().min(8).required(),
}).options({ abortEarly: false });
exports.loginOtherValidation = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
}).options({ abortEarly: false });
exports.updateUserValidation = joi_1.default.object({
    name: joi_1.default.string().optional(),
    email: joi_1.default.string().optional(),
    password: joi_1.default.string().optional(),
    actual_password: joi_1.default.string().required()
}).options({ abortEarly: false });
exports.listUsersValidation = joi_1.default.object({
    type: joi_1.default.string().optional(),
    page: joi_1.default.number().min(1).default(1),
    limit: joi_1.default.number().min(1).default(10),
    skills: joi_1.default.array().items(joi_1.default.string()).optional()
}).options({ abortEarly: false });
