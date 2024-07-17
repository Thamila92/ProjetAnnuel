import Joi from 'joi';

export const notificationValidation = Joi.object({
    userId: Joi.number().required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
}).options({ abortEarly: false });
