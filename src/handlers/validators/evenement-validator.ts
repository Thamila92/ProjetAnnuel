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
    attendees: Attendee[];
    repetitivity: repetitivity;
    description: string;
    quorum: number;
    starting: Date;
    ending: Date;
    location: number;
}

export const evenementValidation = Joi.object<EvenementRequest>({
    type: Joi.string().valid(...Object.values(eventtype)).required(),
    attendees: Joi.array().items(
        Joi.object({
            userId: Joi.number().integer().required(),
            role: Joi.string().valid(...Object.values(AttendeeRole)).default(AttendeeRole.NORMAL).required(),
        })
    ).required(),
    description: Joi.string().required(),
    quorum: Joi.number().required(),
    isVirtual: Joi.boolean().required(),
    virtualLink: Joi.string().optional(),
    location: Joi.number().required(),
    starting: Joi.date().iso().min('now').required(),
    ending: Joi.date().iso().greater(Joi.ref('starting')).required(),
    repetitivity: Joi.string().valid(...Object.values(repetitivity)).required(),
}).options({ abortEarly: false });


export const evenementUpdateValidation = Joi.object<EvenementRequest>({
    type: Joi.string().valid(...Object.values(eventtype)).optional(),
    location: Joi.string().optional(),
    description: Joi.string().optional(),
    quorum: Joi.number().optional(),
    starting: Joi.date().iso().min('now').optional(), 
    ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
    // missionId: Joi.number().required()
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