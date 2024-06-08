import Joi from "joi";

export const missionValidation = Joi.object<MissionRequest>({
    starting: Joi.date().iso().min('now').required(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).required(),
    description: Joi.string().required(),
    eventId:Joi.number().required()
}).options({ abortEarly: false });

export interface MissionRequest {
    eventId:number,
    starting: Date;
    ending: Date;
    description: string;
}





export const missionUpdateValidation = Joi.object<MissionRequest>({
    starting: Joi.date().iso().min('now').optional(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    description: Joi.string().optional(),
    eventId:Joi.number().optional()
}).options({ abortEarly: false });

export interface MissionRequest {
    eventId:number,
    starting: Date;
    ending: Date;
    description: string;
}




export const listMissionValidation = Joi.object<ListMissionRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListMissionRequest {
    page?: number;
    limit?: number;
}
