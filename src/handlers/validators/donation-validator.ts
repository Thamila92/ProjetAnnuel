import Joi from 'joi';

export const donationValidation = Joi.object({
    email: Joi.string().email().required(),
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    montant: Joi.number().min(0).required(),
}).options({ abortEarly: false });
