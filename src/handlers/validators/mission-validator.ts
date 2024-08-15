import Joi from 'joi';

 

export const missionCreateValidation = Joi.object({
    starting: Joi.date().iso().min('now').required(),
    ending: Joi.date().iso().greater(Joi.ref('starting')).required(),
    description: Joi.string().required(),
    skills: Joi.array().items(Joi.string()).optional(),
    userEmails: Joi.array().items(Joi.string().email()).optional(),
    resourceIds: Joi.array().items(Joi.number().required()).optional(),  
}).options({ abortEarly: false });

export const missionUpdateValidation = Joi.object({
    starting: Joi.date().iso().min('now').optional(),
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    description: Joi.string().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    userEmails: Joi.array().items(Joi.string().email()).optional(),
    resources: Joi.array().items(Joi.number().required()).optional(),
}).options({ abortEarly: false });



export const missionIdValidation = Joi.object({
    id: Joi.number().required(),
}).options({ abortEarly: false });

export const listMissionsValidation = Joi.object({
    limit: Joi.number().integer().min(1).default(10),
    page: Joi.number().integer().min(1).default(1),
}).options({ abortEarly: false });
