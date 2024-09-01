import Joi from 'joi';

// Validation pour la création d'un adhérent
export const createAdherentValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    skills: Joi.array().items(Joi.string()).optional(),
    address: Joi.string().optional().allow(null, ''),  // Utilisation de 'address'
    dateDeNaissance: Joi.date().optional().allow(null)
}).options({ abortEarly: false });
// Validation pour la création d'un admin
export const createAdminValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    key: Joi.string().min(8).required(),
}).options({ abortEarly: false });

// Validation pour le login d'un utilisateur
export const loginOtherValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
}).options({ abortEarly: false });

// Validation pour la mise à jour d'un utilisateur
 
// Validation pour la mise à jour d'un utilisateur
export const updateUserValidation = Joi.object({
    email: Joi.string().email().optional(),
    name: Joi.string().optional(),
    adresse: Joi.string().optional(),
    dateDeNaissance: Joi.date().optional(),
    password: Joi.string().optional(),
    statusId: Joi.number().optional(),
    // Toutes les propriétés suivantes sont marquées comme interdites
    createdAt: Joi.any().forbidden(),
    id: Joi.any().forbidden(),
    isAvailable: Joi.any().forbidden(),
    isBanned: Joi.any().forbidden(),
    isDeleted: Joi.any().forbidden(),
    skills: Joi.any().forbidden(),
}).options({ stripUnknown: true, abortEarly: false });


export const createSalarierValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    adresse: Joi.string().optional(),
    dateDeNaissance: Joi.date().optional()
}).options({ abortEarly: false });
// Validation pour la liste des utilisateurs avec pagination et filtre
export const listUsersValidation = Joi.object({
    type: Joi.string().optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).default(10),
    skills: Joi.array().items(Joi.string()).optional()
}).options({ abortEarly: false });
