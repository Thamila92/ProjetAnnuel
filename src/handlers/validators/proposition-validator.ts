import Joi from "joi";

export const propositionValidation = Joi.object<ProjetRequest>({
    description: Joi.string().required(),
    roundId:Joi.number().required()
}).options({ abortEarly: false });

export interface ProjetRequest {
    description: string;
    roundId: number;
}

export const choiceValidation = Joi.object<ProjetRequest>({
    choice: Joi.string().required(),
    roundId:Joi.number().required()
}).options({ abortEarly: false });

export interface ProjetRequest {
    choice: string;
    roundId: number;
}