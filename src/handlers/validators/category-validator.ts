import Joi from "joi";
import { Evenement } from "../../database/entities/evenement";

export const myNewValidation = Joi.object<EvenementCategoryRequest>({
    name: Joi.string()
        .min(3)
        .required(),
    events: Joi.array()
        .required(),
}).options({ abortEarly: false });

export interface EvenementCategoryRequest {
    name: string;
    events: Evenement[];
}

 

export interface ListEvenementCategoryRequest {
    page?: number;
    limit?: number;
}

export const updateEvenementCategoryValidation = Joi.object<UpdateEvenementCategoryRequest>({
    id: Joi.number().required(),
    name: Joi.string().min(1).optional(),
    events: Joi.array().min(1).optional()
});

export interface UpdateEvenementCategoryRequest {
    id: number;
    name?: string;
    events?: Evenement[];
}
