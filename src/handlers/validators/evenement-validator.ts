import Joi from "joi";

enum eventtype {
    AG = "AG",
    suivi = "SUIVI"
}

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
    type: eventtype;
    virtualLink?: string;
    isVirtual: boolean;
    attendees?: Attendee[];
    repetitivity: repetitivity;
    description: string;
    quorum?: number;
    starting: Date;
    ending: Date;
    location: string;
}

export const evenementValidation = Joi.object<EvenementRequest>({
    type: Joi.string().valid(...Object.values(eventtype)).required(),
    attendees: Joi.array().items(
        Joi.object({
            userId: Joi.number().integer().required(),
            role: Joi.string().valid(...Object.values(AttendeeRole)).default(AttendeeRole.NORMAL).required(),
        })
    ).default([]),
    description: Joi.string().required(),
    quorum: Joi.number().default(0),
    isVirtual: Joi.boolean().required(),
    virtualLink: Joi.string().allow('', null).optional(),
    location: Joi.string().required(),
    starting: Joi.date().iso().min('now').required(),
    ending: Joi.date().iso().greater(Joi.ref('starting')).required(),
    repetitivity: Joi.string().valid(...Object.values(repetitivity)).default(repetitivity.NONE),
}).options({ abortEarly: false });

export const evenementUpdateValidation = Joi.object({
    type: Joi.string().valid(...Object.values(eventtype)).optional(),
    location: Joi.string().optional(),
    description: Joi.string().optional(),
    quorum: Joi.number().optional(),
    isVirtual: Joi.boolean().optional(),
    virtualLink: Joi.string().allow('', null).optional(),
    starting: Joi.date().iso().min('now').optional(),
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    repetitivity: Joi.string().valid(...Object.values(repetitivity)).optional(),
}).options({ abortEarly: false });

// export interface EvenementRequest {
//     type: eventtype;
//     location: string;
//     description: string;
//     quorum: number;
//     starting: Date;
//     ending: Date;
//     // missionId: number;
// }


export const listEvenementValidation = Joi.object<ListEvenementRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListEvenementRequest {
    page?: number;
    limit?: number;
}