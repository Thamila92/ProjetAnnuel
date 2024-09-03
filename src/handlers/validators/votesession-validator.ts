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
  id: Joi.number().required().messages({
    'number.base': 'L\'ID de la session est requis et doit être un nombre.',
  }),
  titre: Joi.string().optional().messages({
    'string.empty': 'Le titre ne peut pas être vide.',
  }),
  description: Joi.string().optional().messages({
    'string.empty': 'La description ne peut pas être vide.',
  }),
  modalite: Joi.string()
    .valid('majorité_relative', 'majorité_absolue', 'deux_tours', 'un_tour')
    .optional()
    .messages({
      'any.only': 'Modalité invalide. Choisissez parmi : majorité_relative, majorité_absolue, deux_tours, un_tour.',
    }),
  participants: Joi.array().items(Joi.number()).optional().messages({
    'array.base': 'Les participants doivent être une liste d identifiants.',
  }),
  dateDebut: Joi.date().iso().optional().messages({
    'date.base': 'La date de début doit être une date valide.',
  }),
  dateFin: Joi.date().iso().optional().messages({
    'date.base': 'La date de fin doit être une date valide.',
  }),
  type: Joi.string().valid('classique', 'sondage').optional().messages({
    'any.only': 'Type invalide. Choisissez entre "classique" et "sondage".',
  }),
  options: Joi.array().items(Joi.string()).when('type', {
    is: 'sondage',
    then: Joi.array().min(2).optional().messages({
      'array.min': 'Pour un sondage, il faut au moins deux options.',
    }),
    otherwise: Joi.forbidden(),
  }),
  evenementId: Joi.number().optional().messages({
    'number.base': 'L\'ID de l\'événement doit être un nombre.',
  }),
}).options({ abortEarly: false }); 