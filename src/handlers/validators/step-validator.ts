import Joi from "joi";

enum statustype {
    unstarted="UNSTARTED",
    started= "STARTED",
    running = "RUNNING",
    ended="ENDED"
}

export const stepValidation = Joi.object<StepRequest>({
    state: Joi.string().valid(...Object.values(statustype)).required(),
    description: Joi.string().required(),
    starting: Joi.date().iso().min('now').required(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).required(),
    projetId: Joi.number().required()
    // missionId: Joi.number().required()
}).options({ abortEarly: false });

export interface StepRequest {
    state: statustype;
    description: string;
    starting: Date;
    ending: Date;
    projetId: number
    // missionId: number;
}


export const stepUpdateValidation = Joi.object<StepRequest>({
    state: Joi.string().valid(...Object.values(statustype)).optional(),
    description: Joi.string().optional(),
    starting: Joi.date().iso().min('now').optional(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    projetId: Joi.number().optional()
    // missionId: Joi.number().required()
}).options({ abortEarly: false });


export const listStepValidation = Joi.object<ListStepRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListStepRequest {
    page?: number;
    limit?: number;
}

