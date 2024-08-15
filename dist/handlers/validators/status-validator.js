"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusIdValidation = exports.updateStatusValidation = exports.createStatusValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const status_1 = require("../../database/entities/status");
exports.createStatusValidation = joi_1.default.object({
    type: joi_1.default.string().valid(...Object.values(status_1.statustype)).required(),
    key: joi_1.default.string().optional()
}).options({ abortEarly: false });
exports.updateStatusValidation = joi_1.default.object({
    type: joi_1.default.string().valid(...Object.values(status_1.statustype)).optional(),
    key: joi_1.default.string().optional()
}).options({ abortEarly: false });
exports.statusIdValidation = joi_1.default.object({
    id: joi_1.default.number().integer().required()
}).options({ abortEarly: false });
