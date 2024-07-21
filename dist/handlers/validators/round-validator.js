"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundValidation = void 0;
const joi_1 = __importDefault(require("joi"));
var statustype;
(function (statustype) {
    statustype["unstarted"] = "UNSTARTED";
    statustype["started"] = "STARTED";
    statustype["running"] = "RUNNING";
    statustype["ended"] = "ENDED";
})(statustype || (statustype = {}));
exports.roundValidation = joi_1.default.object({
    // state: Joi.string().valid(...Object.values(statustype)).required(),
    description: joi_1.default.string().required(),
    starting: joi_1.default.date().iso().min('now').required(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).required(),
    voteId: joi_1.default.number().required()
    // missionId: Joi.number().required()
}).options({ abortEarly: false });
