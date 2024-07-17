import Joi from 'joi';

export const noteValidation = Joi.object({
    name: Joi.string().required(),
    content: Joi.string().required(),
}).options({ abortEarly: false });

export const noteUpdateValidation = Joi.object({
    name: Joi.string().optional(),
    content: Joi.string().optional(),
}).options({ abortEarly: false });

export const listNoteValidation = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});
