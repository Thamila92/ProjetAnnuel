"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVoteSessionValidation = exports.createVoteSessionValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createVoteSessionValidation = joi_1.default.object({
    titre: joi_1.default.string().required().messages({
        'string.empty': 'Le titre est requis.',
    }),
    description: joi_1.default.string().required().messages({
        'string.empty': 'La description est requise.',
    }),
    modalite: joi_1.default.string()
        .valid('majorité_relative', 'majorité_absolue', 'deux_tours', 'un_tour')
        .required()
        .messages({
        'any.only': 'Modalité invalide. Choisissez parmi : majorité_relative, majorité_absolue, deux_tours, un_tour.',
    }),
    participants: joi_1.default.array().items(joi_1.default.number()).required().messages({
        'array.base': 'Les participants doivent être une liste d’identifiants.',
    }),
    dateDebut: joi_1.default.date().iso().optional().messages({
        'date.base': 'La date de début doit être une date valide.',
    }),
    dateFin: joi_1.default.date().iso().optional().messages({
        'date.base': 'La date de fin doit être une date valide.',
    }),
    type: joi_1.default.string().valid('classique', 'sondage').required().messages({
        'any.only': 'Type invalide. Choisissez entre "classique" et "sondage".',
    }),
    options: joi_1.default.array().items(joi_1.default.string()).when('type', {
        is: 'sondage',
        then: joi_1.default.array().min(2).required().messages({
            'array.min': 'Pour un sondage, il faut au moins deux options.',
        }),
        otherwise: joi_1.default.forbidden(),
    }),
    evenementId: joi_1.default.number().optional().messages({
        'number.base': 'L\'ID de l\'événement doit être un nombre.',
    }), // Ajout de l'evenementId comme champ optionnel
}).options({ abortEarly: false });
exports.updateVoteSessionValidation = joi_1.default.object({
    titre: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    modalite: joi_1.default.string().valid('majorité_absolue', 'majorité_relative', 'un_tour', 'deux_tours').optional(),
    type: joi_1.default.string().valid('classique', 'sondage').optional(),
    tourActuel: joi_1.default.number().integer().min(1).optional(),
    dateDebut: joi_1.default.date().iso().optional(),
    dateFin: joi_1.default.date().iso().greater(joi_1.default.ref('dateDebut')).optional(),
    participants: joi_1.default.array().items(joi_1.default.number().integer().positive()).optional(),
    options: joi_1.default.when('type', {
        is: 'sondage',
        then: joi_1.default.array().items(joi_1.default.object({
            id: joi_1.default.number().integer().positive().optional(),
            titre: joi_1.default.string().required()
        })).min(2).optional(),
        otherwise: joi_1.default.forbidden()
    }),
    evenementId: joi_1.default.number().integer().positive().allow(null).optional()
}).min(1);
