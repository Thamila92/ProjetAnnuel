"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignResourceToMissionValidation = exports.resourceValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.resourceValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    type: joi_1.default.string().required(),
    isAvailable: joi_1.default.boolean().optional()
}).options({ abortEarly: false });
exports.assignResourceToMissionValidation = joi_1.default.object({
    missionId: joi_1.default.number().required(),
    resourceIds: joi_1.default.array().items(joi_1.default.number()).required()
}).options({ abortEarly: false });
