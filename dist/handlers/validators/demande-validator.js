"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demandeValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.demandeValidation = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    nom: joi_1.default.string().required(),
    prenom: joi_1.default.string().required(),
    age: joi_1.default.number().min(0).required(),
    phone: joi_1.default.string().required(),
    profession: joi_1.default.string().optional(),
    titre: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    budget: joi_1.default.number().min(0).required(),
    deadline: joi_1.default.date().iso().required(),
    statut: joi_1.default.string().valid('en_attente', 'approuvée', 'rejetée').default('en_attente')
}).options({ abortEarly: false });
const demandeUpdateValidation = joi_1.default.object({
    nom: joi_1.default.string().optional(),
    prenom: joi_1.default.string().optional(),
    email: joi_1.default.string().email().optional(),
    age: joi_1.default.number().min(0).optional(),
    phone: joi_1.default.string().optional(),
    profession: joi_1.default.string().optional(),
    titre: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    budget: joi_1.default.number().min(0).optional(),
    deadline: joi_1.default.date().iso().optional(),
    statut: joi_1.default.string().valid('en attente', 'approuvée', 'rejetée').optional()
}).or('nom', 'prenom', 'email', 'age', 'phone', 'titre', 'description', 'budget', 'deadline', 'statut');
// Utiliser '.or()' assure qu'au moins un de ces champs doit être présent.
