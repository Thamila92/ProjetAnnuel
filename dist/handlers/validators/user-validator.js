"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersValidation = exports.createSalarierValidation = exports.updateUserValidation = exports.loginOtherValidation = exports.createAdminValidation = exports.createAdherentValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation pour la création d'un adhérent
exports.createAdherentValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    skills: joi_1.default.array().items(joi_1.default.string()).optional(),
    address: joi_1.default.string().optional().allow(null, ''), // Utilisation de 'address'
    dateDeNaissance: joi_1.default.date().optional().allow(null)
}).options({ abortEarly: false });
// Validation pour la création d'un admin
exports.createAdminValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    key: joi_1.default.string().min(8).required(),
}).options({ abortEarly: false });
// Validation pour le login d'un utilisateur
exports.loginOtherValidation = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
}).options({ abortEarly: false });
// Validation pour la mise à jour d'un utilisateur
// Validation pour la mise à jour d'un utilisateur
exports.updateUserValidation = joi_1.default.object({
    email: joi_1.default.string().email().optional(),
    name: joi_1.default.string().optional(),
    adresse: joi_1.default.string().optional(),
    dateDeNaissance: joi_1.default.date().optional(),
    password: joi_1.default.string().optional(),
    statusId: joi_1.default.number().optional(),
    // Toutes les propriétés suivantes sont marquées comme interdites
    createdAt: joi_1.default.any().forbidden(),
    id: joi_1.default.any().forbidden(),
    isAvailable: joi_1.default.any().forbidden(),
    isBanned: joi_1.default.any().forbidden(),
    isDeleted: joi_1.default.any().forbidden(),
    skills: joi_1.default.any().forbidden(),
}).options({ stripUnknown: true, abortEarly: false });
exports.createSalarierValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    adresse: joi_1.default.string().optional(),
    dateDeNaissance: joi_1.default.date().optional()
}).options({ abortEarly: false });
// Validation pour la liste des utilisateurs avec pagination et filtre
exports.listUsersValidation = joi_1.default.object({
    type: joi_1.default.string().optional(),
    page: joi_1.default.number().min(1).default(1),
    limit: joi_1.default.number().min(1).default(10),
    skills: joi_1.default.array().items(joi_1.default.string()).optional()
}).options({ abortEarly: false });
