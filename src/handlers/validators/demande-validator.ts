import Joi from 'joi';

export const demandeValidation = Joi.object({
    email: Joi.string().email().required(),
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    age: Joi.number().min(0).required(),
    phone: Joi.string().required(),
    profession: Joi.string().optional(),
    titre: Joi.string().required(),
    description: Joi.string().required(),
    budget: Joi.number().min(0).required(),
    deadline: Joi.date().iso().required(),
    statut: Joi.string().valid('en_attente', 'approuvée', 'rejetée').default('en_attente')
}).options({ abortEarly: false });

const demandeUpdateValidation = Joi.object({
    nom: Joi.string().optional(),
    prenom: Joi.string().optional(),
    email: Joi.string().email().optional(),
    age: Joi.number().min(0).optional(),
    phone: Joi.string().optional(),
    profession: Joi.string().optional(),
    titre: Joi.string().optional(),
    description: Joi.string().optional(),
    budget: Joi.number().min(0).optional(),
    deadline: Joi.date().iso().optional(),
    statut: Joi.string().valid('en attente', 'approuvée', 'rejetée').optional()
}).or('nom', 'prenom', 'email', 'age', 'phone', 'titre', 'description', 'budget', 'deadline', 'statut');
// Utiliser '.or()' assure qu'au moins un de ces champs doit être présent.


