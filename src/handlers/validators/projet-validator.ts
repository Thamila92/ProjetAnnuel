import Joi from "joi";

export const projetValidation = Joi.object<ProjetRequest>({
    userId:Joi.number().required(),
    description: Joi.string().required(),
    starting: Joi.date().iso().min('now').required(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).required(),
}).options({ abortEarly: false });

export interface ProjetRequest {
    userId:number;
    description: string;
    starting: Date;
    ending: Date;
}


export const projetUpdateValidation = Joi.object<ProjetRequest>({
    userId:Joi.number().optional(),
    description: Joi.string().optional(),
    starting: Joi.date().iso().min('now').optional(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
}).options({ abortEarly: false });

export interface ProjetRequest {
    userId:number;
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
