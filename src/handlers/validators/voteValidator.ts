import Joi from 'joi';

// Validation pour un vote classique
export const classicVoteValidation = Joi.object({
    userId: Joi.number().required(),
    sessionId: Joi.number().required(),
    choix: Joi.string().valid('pour', 'contre').required()  // Choix pour un vote classique
}).options({ abortEarly: false });

// Validation pour un sondage
export const pollVoteValidation = Joi.object({
    userId: Joi.number().required(),
    sessionId: Joi.number().required(),
    optionId: Joi.number().required()  // Option choisie lors du sondage
}).options({ abortEarly: false });