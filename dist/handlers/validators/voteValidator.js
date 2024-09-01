"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollVoteValidation = exports.classicVoteValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation pour un vote classique
exports.classicVoteValidation = joi_1.default.object({
    userId: joi_1.default.number().required(),
    sessionId: joi_1.default.number().required(),
    choix: joi_1.default.string().valid('pour', 'contre').required() // Choix pour un vote classique
}).options({ abortEarly: false });
// Validation pour un sondage
exports.pollVoteValidation = joi_1.default.object({
    userId: joi_1.default.number().required(),
    sessionId: joi_1.default.number().required(),
    optionId: joi_1.default.number().required() // Option choisie lors du sondage
}).options({ abortEarly: false });
