import Joi from "joi";

// enum eventtype {
//     AG = "AG",
//     suivi = "SUIVI"
// }

import { eventtype } from "../../types/event-types";

enum repetitivity {
    MONTHLY = "MONTHLY",
    ANNUAL = "ANNUAL",
    NONE = "NONE",
}

enum AttendeeRole {
    IMPORTANT = "IMPORTANT",
    NORMAL = "NORMAL",
}

export interface Attendee {
    userId: number;
    role: AttendeeRole;
}

export interface EvenementRequest {
    type?: eventtype;  // type is optional
    virtualLink?: string;
    isVirtual: boolean;
    attendees: Attendee[];
    repetitivity: repetitivity;
    description?: string;  // description is optional
    quorum?: number;  // quorum is optional
    starting?: Date;  // starting is optional
    ending?: Date;  // ending is optional
    location?: number;  // location is optional
}

export const evenementValidation = Joi.object<EvenementRequest>({
    type: Joi.string().valid(...Object.values(eventtype)).optional(),
    attendees: Joi.array().items(
        Joi.object({
            userId: Joi.number().integer().required(),
            role: Joi.string().valid(...Object.values(AttendeeRole)).default(AttendeeRole.NORMAL).required(),
        })
    ).required(),
    description: Joi.string().optional(),
    quorum: Joi.number().optional(),
    isVirtual: Joi.boolean().required(),
    virtualLink: Joi.string().optional(),
    location: Joi.number().optional(),
    starting: Joi.date().iso().min('now').optional(),
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    repetitivity: Joi.string().valid(...Object.values(repetitivity)).optional(),
}).options({ abortEarly: false });

export interface UpdateEvenementParams {
    type?: eventtype;
    location?: string;
    description?: string;
    quorum?: number;
    starting?: Date;
    ending?: Date;
    missionId?: number;
}

export const evenementUpdateValidation = Joi.object<UpdateEvenementParams>({
    type: Joi.string().valid(...Object.values(eventtype)).optional(),
    location: Joi.string().optional(),
    description: Joi.string().optional(),
    quorum: Joi.number().optional(),
    starting: Joi.date().iso().min('now').optional(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    missionId: Joi.number().optional()
}).options({ abortEarly: false });

export const listEvenementValidation = Joi.object<ListEvenementRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListEvenementRequest {
    page?: number;
    limit?: number;
}
