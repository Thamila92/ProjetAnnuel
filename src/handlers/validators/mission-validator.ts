import Joi from "joi";

export const missionValidation = Joi.object<MissionRequest>({
    starting: Joi.date().iso().required(),
    ending: Joi.date().iso().required(),
    description: Joi.string().required(),
    eventId:Joi.number().required()
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
