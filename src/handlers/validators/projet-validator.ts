import Joi from "joi";

export const projetValidation = Joi.object<ProjetRequest>({
    description: Joi.string().required(),
    starting: Joi.date().iso().required(),
    ending: Joi.date().iso().required()
}).options({ abortEarly: false });

export interface ProjetRequest {
    description: string;
    starting: Date;
    ending: Date;
}

export const listProjetValidation = Joi.object<ListProjetRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListProjetRequest {
    page?: number;
    limit?: number;
}
