"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentIdValidation = exports.updateDocumentValidation = exports.createDocumentValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createDocumentValidation = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    type: joi_1.default.string().required(),
    path: joi_1.default.string().required(),
    userId: joi_1.default.number().required(),
}).options({ abortEarly: false });
exports.updateDocumentValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    title: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    type: joi_1.default.string().optional(),
    path: joi_1.default.string().optional(),
    userId: joi_1.default.number().optional(),
}).options({ abortEarly: false });
exports.documentIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
}).options({ abortEarly: false });
