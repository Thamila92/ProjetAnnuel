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
 
 
export interface MissionRequest {
    eventId: number;
    starting: Date;
    ending: Date;
    description: string;
    skills?: string[];
    userEmails?: string[];
    resources?: number[];
}

export const listMissionValidation = Joi.object<ListMissionRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListMissionRequest {
    page?: number;
    limit?: number;
}

export interface UpdateMissionParams {
    eventId?: number,
    starting?: Date;
    ending?: Date;
    description?: string;
    skills?: string[];
    userEmails?: string[];
    resources?: number[];
}

export const missionUpdateValidation = Joi.object<MissionRequest>({
    starting: Joi.date().iso().min('now').optional(),
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    description: Joi.string().optional(),
    eventId: Joi.number().optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    userEmails: Joi.array().items(Joi.string().email()).optional(),
    resources: Joi.array().items(Joi.number().integer()).optional()
}).options({ abortEarly: false });

