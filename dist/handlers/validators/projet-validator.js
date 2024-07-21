"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjetValidation = exports.projetUpdateValidation = exports.projetValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.projetValidation = joi_1.default.object({
    description: joi_1.default.string().required(),
    starting: joi_1.default.date().iso().min('now').required(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).required(),
}).options({ abortEarly: false });
exports.projetUpdateValidation = joi_1.default.object({
    userId: joi_1.default.number().optional(),
    description: joi_1.default.string().optional(),
    starting: joi_1.default.date().iso().min('now').optional(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).optional(),
}).options({ abortEarly: false });
exports.listProjetValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
