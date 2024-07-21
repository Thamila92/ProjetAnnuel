"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseIdValidation = exports.updateResponseValidation = exports.createResponseValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createResponseValidation = joi_1.default.object({
    content: joi_1.default.string().required(),
    voteId: joi_1.default.number().required(),
    userId: joi_1.default.number().required(),
}).options({ abortEarly: false });
exports.updateResponseValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    content: joi_1.default.string().optional(),
    voteId: joi_1.default.number().optional(),
    userId: joi_1.default.number().optional(),
}).options({ abortEarly: false });
exports.responseIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
}).options({ abortEarly: false });
exports.default = {
    createResponseValidation: exports.createResponseValidation,
    updateResponseValidation: exports.updateResponseValidation,
    responseIdValidation: exports.responseIdValidation
};
