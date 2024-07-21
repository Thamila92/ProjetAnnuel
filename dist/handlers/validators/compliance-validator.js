"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listComplianceValidation = exports.complianceValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.complianceValidation = joi_1.default.object({
    description: joi_1.default.string().required(),
    status: joi_1.default.string().required(),
    userId: joi_1.default.number().required(),
    missionId: joi_1.default.number().required()
}).options({ abortEarly: false });
exports.listComplianceValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
