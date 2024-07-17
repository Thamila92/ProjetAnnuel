import Joi from "joi";

export const resourceValidation = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    isAvailable: Joi.boolean().optional()
}).options({ abortEarly: false });

export const assignResourceToMissionValidation = Joi.object({
    missionId: Joi.number().required(),
    resourceIds: Joi.array().items(Joi.number()).required()
}).options({ abortEarly: false });
