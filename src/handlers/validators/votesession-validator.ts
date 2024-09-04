import Joi from 'joi';

export const createVoteSessionValidation = Joi.object({
  titre: Joi.string().required().messages({
    'string.empty': 'Le titre est requis.',
  }),
  description: Joi.string().required().messages({
    'string.empty': 'La description est requise.',
  }),
  modalite: Joi.string()
    .valid('majorité_relative', 'majorité_absolue', 'deux_tours', 'un_tour')
    .required()
    .messages({
      'any.only': 'Modalité invalide. Choisissez parmi : majorité_relative, majorité_absolue, deux_tours, un_tour.',
    }),
  participants: Joi.array().items(Joi.number()).required().messages({
    'array.base': 'Les participants doivent être une liste d’identifiants.',
  }),
  dateDebut: Joi.date().iso().optional().messages({
    'date.base': 'La date de début doit être une date valide.',
  }),
  dateFin: Joi.date().iso().optional().messages({
    'date.base': 'La date de fin doit être une date valide.',
  }),
  type: Joi.string().valid('classique', 'sondage').required().messages({
    'any.only': 'Type invalide. Choisissez entre "classique" et "sondage".',
  }),
  options: Joi.array().items(Joi.string()).when('type', {
    is: 'sondage',
    then: Joi.array().min(2).required().messages({
      'array.min': 'Pour un sondage, il faut au moins deux options.',
    }),
    otherwise: Joi.forbidden(),
  }),
  evenementId: Joi.number().optional().messages({
    'number.base': 'L\'ID de l\'événement doit être un nombre.',
  }),  // Ajout de l'evenementId comme champ optionnel
}).options({ abortEarly: false });


 

export const updateVoteSessionValidation = Joi.object({
  titre: Joi.string().optional(),
  description: Joi.string().optional(),
  modalite: Joi.string().valid('majorité_absolue', 'majorité_relative', 'un_tour', 'deux_tours').optional(),
  type: Joi.string().valid('classique', 'sondage').optional(),
  tourActuel: Joi.number().integer().min(1).optional(),
  dateDebut: Joi.date().iso().optional(),
  dateFin: Joi.date().iso().greater(Joi.ref('dateDebut')).optional(),
  participants: Joi.array().items(Joi.number().integer().positive()).optional(),
  options: Joi.when('type', {
    is: 'sondage',
    then: Joi.array().items(Joi.object({
      id: Joi.number().integer().positive().optional(),
      titre: Joi.string().required()
    })).min(2).optional(),
    otherwise: Joi.forbidden()
  }),
  evenementId: Joi.number().integer().positive().allow(null).optional()
}).min(1);