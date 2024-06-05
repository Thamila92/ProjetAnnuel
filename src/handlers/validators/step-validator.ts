import Joi from "joi";

export const stepValidation = Joi.object<StepRequest>({
    state: Joi.string().required(),
    description: Joi.string().required(),
    starting: Joi.date().iso().required(),
    ending: Joi.date().iso().required(),
    projetId: Joi.number().required(),
    missionId: Joi.number().required()
}).options({ abortEarly: false });

export interface StepRequest {
    state: string;
    description: string;
    starting: Date;
    ending: Date;
    projetId: number;
    missionId: number;
}

export const listStepValidation = Joi.object<ListStepRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListStepRequest {
    page?: number;
    limit?: number;
}
