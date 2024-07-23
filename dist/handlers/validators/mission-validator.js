"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionUpdateValidation = exports.listMissionValidation = exports.missionValidation = void 0;
const joi_1 = __importDefault(require("joi"));
var statustype;
(function (statustype) {
    statustype["unstarted"] = "UNSTARTED";
    statustype["started"] = "STARTED";
    statustype["running"] = "RUNNING";
    statustype["ended"] = "ENDED";
})(statustype || (statustype = {}));
exports.missionValidation = joi_1.default.object({
    starting: joi_1.default.date().iso().min('now').required(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).required(),
    description: joi_1.default.string().required(),
    eventId: joi_1.default.number().required()
}).options({ abortEarly: false });
exports.listMissionValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
exports.missionUpdateValidation = joi_1.default.object({
    starting: joi_1.default.date().iso().min('now').optional(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).optional(),
    description: joi_1.default.string().optional(),
    eventId: joi_1.default.number().optional(),
    skills: joi_1.default.array().items(joi_1.default.string()).optional(),
    userEmails: joi_1.default.array().items(joi_1.default.string().email()).optional(),
    resources: joi_1.default.array().items(joi_1.default.number().integer()).optional()
}).options({ abortEarly: false });
