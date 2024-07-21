"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectIdValidation = exports.updateSubjectValidation = exports.createSubjectValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createSubjectValidation = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
}).options({ abortEarly: false });
exports.updateSubjectValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    title: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
}).options({ abortEarly: false });
exports.subjectIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
}).options({ abortEarly: false });
exports.default = {
    createSubjectValidation: exports.createSubjectValidation,
    updateSubjectValidation: exports.updateSubjectValidation,
    subjectIdValidation: exports.subjectIdValidation
};
