"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.choiceValidation = exports.propositionValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.propositionValidation = joi_1.default.object({
    description: joi_1.default.string().required(),
    roundId: joi_1.default.number().required()
}).options({ abortEarly: false });
exports.choiceValidation = joi_1.default.object({
    choice: joi_1.default.string().required(),
    roundId: joi_1.default.number().required()
}).options({ abortEarly: false });
