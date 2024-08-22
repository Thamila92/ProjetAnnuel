"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.donationValidation = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    nom: joi_1.default.string().required(),
    prenom: joi_1.default.string().required(),
    montant: joi_1.default.number().min(0).required(),
}).options({ abortEarly: false });
