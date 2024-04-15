import Joi from "joi";

export const evenementValidation = Joi.object<EvenementRequest>({
    name: Joi.string()
        .min(3)
        .required(),
    date: Joi.date()
        .iso()
        .required(),
}).options({ abortEarly: false });

export interface EvenementRequest {
    name: string;
    date: Date;
}

export const listEvenementValidation = Joi.object<ListEvenementRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListEvenementRequest {
    page?: number;
    limit?: number;
}
