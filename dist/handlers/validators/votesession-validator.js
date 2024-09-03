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
    id: joi_1.default.number().required().messages({
        'number.base': 'L\'ID de la session est requis et doit être un nombre.',
    }),
    titre: joi_1.default.string().optional().messages({
        'string.empty': 'Le titre ne peut pas être vide.',
    }),
    description: joi_1.default.string().optional().messages({
        'string.empty': 'La description ne peut pas être vide.',
    }),
    modalite: joi_1.default.string()
        .valid('majorité_relative', 'majorité_absolue', 'deux_tours', 'un_tour')
        .optional()
        .messages({
        'any.only': 'Modalité invalide. Choisissez parmi : majorité_relative, majorité_absolue, deux_tours, un_tour.',
    }),
    participants: joi_1.default.array().items(joi_1.default.number()).optional().messages({
        'array.base': 'Les participants doivent être une liste d identifiants.',
    }),
    dateDebut: joi_1.default.date().iso().optional().messages({
        'date.base': 'La date de début doit être une date valide.',
    }),
    dateFin: joi_1.default.date().iso().optional().messages({
        'date.base': 'La date de fin doit être une date valide.',
    }),
    type: joi_1.default.string().valid('classique', 'sondage').optional().messages({
        'any.only': 'Type invalide. Choisissez entre "classique" et "sondage".',
    }),
    options: joi_1.default.array().items(joi_1.default.string()).when('type', {
        is: 'sondage',
        then: joi_1.default.array().min(2).optional().messages({
            'array.min': 'Pour un sondage, il faut au moins deux options.',
        }),
        otherwise: joi_1.default.forbidden(),
    }),
    evenementId: joi_1.default.number().optional().messages({
        'number.base': 'L\'ID de l\'événement doit être un nombre.',
    }),
}).options({ abortEarly: false });
