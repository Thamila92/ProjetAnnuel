import Joi from "joi";
enum eventtype {
    AG = "AG",
    suivi="SUIVI"
}

export const evenementValidation = Joi.object<EvenementRequest>({
    type: Joi.string().valid(...Object.values(eventtype)).required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
    quorum: Joi.number().optional(),
    starting: Joi.date().iso().min('now').required(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).required(),
    // missionId: Joi.number().required()
}).options({ abortEarly: false });

export interface EvenementRequest {
    type: string;
    location: string;
    description: string;
    quorum: number;
    starting: Date;
    ending: Date;
    // missionId: number;
}


export const evenementUpdateValidation = Joi.object<EvenementRequest>({
    type: Joi.string().valid(...Object.values(eventtype)).optional(),
    location: Joi.string().optional(),
    description: Joi.string().optional(),
    quorum: Joi.number().optional(),
    starting: Joi.date().iso().min('now').optional(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    // missionId: Joi.number().required()
}).options({ abortEarly: false });

export interface EvenementRequest {
    type: string;
    location: string;
    description: string;
    quorum: number;
    starting: Date;
    ending: Date;
    // missionId: number;
}


export const listEvenementValidation = Joi.object<ListEvenementRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListEvenementRequest {
    page?: number;
    limit?: number;
}
