"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStepValidation = exports.stepUpdateValidation = exports.stepValidation = void 0;
const joi_1 = __importDefault(require("joi"));
var statustype;
(function (statustype) {
    statustype["unstarted"] = "UNSTARTED";
    statustype["started"] = "STARTED";
    statustype["running"] = "RUNNING";
    statustype["ended"] = "ENDED";
})(statustype || (statustype = {}));
exports.stepValidation = joi_1.default.object({
    state: joi_1.default.string().valid(...Object.values(statustype)).required(),
    description: joi_1.default.string().required(),
    starting: joi_1.default.date().iso().min('now').required(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).required(),
    projetId: joi_1.default.number().required()
    // missionId: Joi.number().required()
}).options({ abortEarly: false });
exports.stepUpdateValidation = joi_1.default.object({
    state: joi_1.default.string().valid(...Object.values(statustype)).optional(),
    description: joi_1.default.string().optional(),
    starting: joi_1.default.date().iso().min('now').optional(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).optional(),
    projetId: joi_1.default.number().optional()
    // missionId: Joi.number().required()
}).options({ abortEarly: false });
exports.listStepValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
