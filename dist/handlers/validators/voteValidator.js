"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjetValidation = exports.voteValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.voteValidation = joi_1.default.object({
    description: joi_1.default.string().required(),
    starting: joi_1.default.date().iso().min('now').required(),
    ending: joi_1.default.date().iso().greater(joi_1.default.ref('starting')).required(),
    rounds: joi_1.default.number().required()
}).options({ abortEarly: false });
// export const projetUpdateValidation = Joi.object<ProjetRequest>({
//     userId:Joi.number().optional(),
//     description: Joi.string().optional(),
//     starting: Joi.date().iso().min('now').optional(), 
//     ending: Joi.date().iso().greater(Joi.ref('starting')).optional(),
// }).options({ abortEarly: false });
// export interface ProjetRequest {
//     userId:number;
//     description: string;
//     starting: Date;
//     ending: Date;
// }
exports.listProjetValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
