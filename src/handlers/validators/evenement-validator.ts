import Joi from 'joi';
import { eventtype, repetitivity, AttendeeRole } from '../../types/event-types';

export const evenementValidation = Joi.object({
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
    maxParticipants: Joi.number().integer().positive().required(),
    currentParticipants: Joi.number().integer().min(0).default(0).optional(),
    membersOnly: Joi.boolean().default(false)  
}).options({ abortEarly: false })


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
    maxParticipants: Joi.number().integer().positive().optional(),
    currentParticipants: Joi.number().integer().positive().optional(),  // Ajoutez ceci
    membersOnly: Joi.boolean().optional()  // Ajoutez ceci
}).options({ abortEarly: false });



export const evenementIdValidation = Joi.object({
    id: Joi.number().required(),
}).options({ abortEarly: false });

export const listEvenementsValidation = Joi.object({
    limit: Joi.number().min(1).optional(),
    page: Joi.number().min(1).optional(),
}).options({ abortEarly: false });
export const evenementAttendeeValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(1).required()
}).options({ abortEarly: false });
