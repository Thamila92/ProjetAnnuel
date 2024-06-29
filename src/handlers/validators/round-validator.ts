import Joi from "joi";

enum statustype {
    unstarted="UNSTARTED",
    started= "STARTED",
    running = "RUNNING",
    ended="ENDED"
}

export const roundValidation = Joi.object<StepRequest>({
    // state: Joi.string().valid(...Object.values(statustype)).required(),
    description: Joi.string().required(),
    starting: Joi.date().iso().min('now').required(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).required(),
    voteId: Joi.number().required()
    // missionId: Joi.number().required()
}).options({ abortEarly: false });

export interface StepRequest {
    // state: statustype;
    description: string;
    starting: Date;
    ending: Date;
    voteId: number
    // missionId: number;
}