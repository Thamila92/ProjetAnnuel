"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEvenementValidation = exports.evenementUpdateValidation = exports.evenementValidation = void 0;
const joi_1 = __importDefault(require("joi"));
var eventtype;
(function (eventtype) {
    eventtype["AG"] = "AG";
    eventtype["suivi"] = "SUIVI";
})(eventtype || (eventtype = {}));
var repetitivity;
(function (repetitivity) {
    repetitivity["MONTHLY"] = "MONTHLY";
    repetitivity["ANNUAL"] = "ANNUAL";
    repetitivity["NONE"] = "NONE";
})(repetitivity || (repetitivity = {}));
var AttendeeRole;
(function (AttendeeRole) {
    AttendeeRole["IMPORTANT"] = "IMPORTANT";
    AttendeeRole["NORMAL"] = "NORMAL";
})(AttendeeRole || (AttendeeRole = {}));
exports.evenementValidation = joi_1.default.object({
    type: joi_1.default.string().valid(...Object.values(eventtype)).required(),
    attendees: joi_1.default.array().items(joi_1.default.object({
        userId: joi_1.default.number().integer().required(),
        role: joi_1.default.string().valid(...Object.values(AttendeeRole)).default(AttendeeRole.NORMAL).required(),
    })).default([]),
    description: joi_1.default.string().required(),
    quorum: joi_1.default.number().default(0),
    isVirtual: joi_1.default.boolean().required(),
    virtualLink: joi_1.default.string().allow('', null).optional(),
    location: joi_1.default.string().required(),
    starting: joi_1.default.date().iso().min('now').required(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).required(),
    repetitivity: joi_1.default.string().valid(...Object.values(repetitivity)).default(repetitivity.NONE),
}).options({ abortEarly: false });
exports.evenementUpdateValidation = joi_1.default.object({
    type: joi_1.default.string().valid(...Object.values(eventtype)).optional(),
    location: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    quorum: joi_1.default.number().optional(),
    isVirtual: joi_1.default.boolean().optional(),
    virtualLink: joi_1.default.string().allow('', null).optional(),
    starting: joi_1.default.date().iso().min('now').optional(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).optional(),
    repetitivity: joi_1.default.string().valid(...Object.values(repetitivity)).optional(),
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
exports.listEvenementValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
