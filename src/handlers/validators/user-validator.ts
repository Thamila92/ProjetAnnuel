import Joi from 'joi';

export const createAdherentValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    skills: Joi.array().items(Joi.string()).optional(),
}).options({ abortEarly: false });

export const createAdminValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    key: Joi.string().min(8).required(),   
}).options({ abortEarly: false });

export const loginOtherValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
}).options({ abortEarly: false });

export const updateUserValidation = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    actual_password: Joi.string().required()
}).options({ abortEarly: false });

export const listUsersValidation = Joi.object({
    type: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    skills: Joi.array().items(Joi.string()).optional()
}).options({ abortEarly: false });
